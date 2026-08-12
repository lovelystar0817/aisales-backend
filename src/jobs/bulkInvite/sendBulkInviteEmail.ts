import { Job } from '@hokify/agenda';
import { Types } from 'mongoose';
import { BulkInvite } from '../../models/BulkInvite.js';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';
import { AllowlistManageUser } from '../../models/AllowlistManageUser.js';
import { Team } from '../../models/Team.js';
import { Company } from '../../models/Company.js';
import { EMAIL_CATEGORY, sendEmail } from '../../utils/email.js';
import {
  NOTIFY_FROM_NAME,
  DEFAULT_LANGUAGE,
  BULK_INVITE_MAX_RETRIES,
  AGENDA_JOB_TYPES,
} from '../../utils/constants.js';
import { getAppUrl } from '../../utils/manage/shared.js';
import { getTranslation } from '../../locale/translation.js';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

// Exponential backoff delays in milliseconds: 30s, 2min, 3min
const RETRY_DELAYS = [
  30 * 1000, // 30 seconds
  2 * 60 * 1000, // 2 minutes
  3 * 60 * 1000, // 3 minutes
];

type SendBulkInviteEmailData = {
  bulkInviteId: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  teamNames: string[];
  companyId: string;
  inviterEmail: string;
};

type Handler = (job: Job<SendBulkInviteEmailData>) => Promise<void>;

export const sendBulkInviteEmail: Handler = async (job) => {
  const { bulkInviteId, email, role, teamNames, companyId, inviterEmail } =
    job.attrs.data ?? {};

  if (!bulkInviteId || !email || !role || !companyId) {
    throw new Error('Missing required fields');
  }

  const bulkInvite = await BulkInvite.findById(bulkInviteId);

  if (!bulkInvite) {
    throw new Error(`BulkInvite ${bulkInviteId} not found`);
  }

  // Find the item for this email
  const item = bulkInvite.items.find((i) => i.email === email);

  if (!item) {
    throw new Error(`Item not found for email ${email}`);
  }

  // Check if already sent
  if (item.emailSent) {
    console.log(`Email already sent to ${email}`);
    return;
  }

  try {
    // Get team ObjectIds
    let teamIds: Types.ObjectId[] = [];
    if (teamNames.length > 0) {
      const teams = await Team.find({
        company: new Types.ObjectId(companyId),
        name: { $in: teamNames },
      });
      teamIds = teams.map((t) => t._id);
    }

    // Create or revive user record based on role
    const normalizedEmail = email.toLowerCase();
    const companyObjectId = new Types.ObjectId(companyId);

    if (role === 'user') {
      // User: revive existing soft-deleted row if exists, otherwise insert new
      const revived = await User.findOneAndUpdate(
        { email: normalizedEmail, company: companyObjectId, isDeleted: true },
        {
          $set: {
            isDeleted: false,
            status: 'invited',
            teams: teamIds,
            role: 'user',
          },
          $unset: { auth0Id: '' },
        },
        { new: true },
      );

      if (!revived) {
        await User.create({
          email: normalizedEmail,
          company: companyObjectId,
          status: 'invited',
          teams: teamIds,
          role: 'user',
        });
      }

      // ManageUser: delete row if exists
      await ManageUser.deleteOne({
        email: normalizedEmail,
        company: companyObjectId,
      });
    } else {
      // Admin/superadmin: add to allowlist
      await AllowlistManageUser.findOneAndUpdate(
        { email: normalizedEmail, company: companyObjectId },
        { email: normalizedEmail, company: companyObjectId },
        { upsert: true },
      );

      // ManageUser: revive existing soft-deleted row if exists, otherwise insert new
      const revivedManageUser = await ManageUser.findOneAndUpdate(
        { email: normalizedEmail, company: companyObjectId, isDeleted: true },
        {
          $set: {
            isDeleted: false,
            status: 'invited',
            role: role,
            teams: role === 'superadmin' ? [] : teamIds,
          },
          $unset: { auth0Id: '' },
        },
        { new: true },
      );

      if (!revivedManageUser) {
        await ManageUser.create({
          email: normalizedEmail,
          company: companyObjectId,
          role: role,
          status: 'invited',
          teams: role === 'superadmin' ? [] : teamIds,
        });
      }

      // User: revive existing soft-deleted row if exists, no insert if none
      await User.findOneAndUpdate(
        { email: normalizedEmail, company: companyObjectId },
        {
          $set: {
            isDeleted: false,
            status: 'invited',
            teams: role === 'superadmin' ? [] : teamIds,
          },
        },
      );
    }

    // Send email
    // Get company friendlyId for user role
    const company = await Company.findById(companyId).select('friendlyId');

    // Generate appropriate URL based on environment and role
    const link = getAppUrl(role, company?.friendlyId);

    const sendInviteTemplatePath = path.join(
      process.cwd(),
      `src/views/email/${role === 'user' ? 'invite_user' : 'invite_admin'}.html`,
    );

    const template = fs.readFileSync(sendInviteTemplatePath, 'utf8');

    const subject = getTranslation(
      DEFAULT_LANGUAGE,
      role === 'user'
        ? 'email.user_invitation_subject'
        : 'email.admin_invitation_subject',
      role === 'user'
        ? `You've been invited to join Hupo`
        : 'Invitation to access Hupo Admin App',
    );

    const payload: any = { link };
    if (role !== 'user') {
      payload.inviterEmail = inviterEmail;
    }

    const html = ejs.render(template, payload);

    await sendEmail({
      from: {
        name: NOTIFY_FROM_NAME,
        email: process.env.NOTIFY_EMAIL ?? '',
      },
      to: email,
      subject,
      html,
      text: html,
      category:
        role === 'user'
          ? EMAIL_CATEGORY.INVITE_USER
          : EMAIL_CATEGORY.INVITE_ADMIN,
    });

    // Update item as sent using atomic operations to prevent race condition
    await BulkInvite.updateOne(
      {
        _id: bulkInvite._id,
        'items.email': email,
      },
      {
        $set: {
          'items.$.emailSent': true,
          'items.$.emailSentAt': new Date(),
        },
        $inc: {
          sentCount: 1,
        },
      },
    );

    // Check if all valid items are processed
    await checkAndCompleteBulkInvite(bulkInviteId);

    console.log(`Successfully sent invite email to ${email}`);

    // Add 1 second delay to avoid SendGrid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error: any) {
    console.error(`Error sending invite email to ${email}:`, error);

    // Update item with error using atomic operations
    const currentRetryCount = item.retryCount + 1;

    await BulkInvite.updateOne(
      {
        _id: bulkInvite._id,
        'items.email': email,
      },
      {
        $set: {
          'items.$.emailError': error.message,
          'items.$.lastRetryAt': new Date(),
        },
        $inc: {
          'items.$.retryCount': 1,
        },
      },
    );

    // If not max retries, schedule retry with exponential backoff
    if (currentRetryCount < BULK_INVITE_MAX_RETRIES) {
      // Get delay based on retry count (exponential backoff)
      const delayIndex = Math.min(
        currentRetryCount - 1,
        RETRY_DELAYS.length - 1,
      );
      const retryDelay = RETRY_DELAYS[delayIndex];
      const retryAt = new Date(Date.now() + retryDelay);

      console.log(
        `Scheduling retry ${currentRetryCount}/${BULK_INVITE_MAX_RETRIES} for ${email} in ${retryDelay / 1000 / 60} minutes`,
      );

      try {
        const agenda = job.agenda;
        await agenda.schedule(
          retryAt,
          AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL,
          job.attrs.data,
        );
      } catch (scheduleError: any) {
        console.error(`Failed to schedule retry for ${email}:`, scheduleError);
        // If we can't schedule retry, mark as failed
        await BulkInvite.updateOne(
          { _id: bulkInvite._id },
          { $inc: { failedCount: 1 } },
        );
        await checkAndCompleteBulkInvite(bulkInviteId);
      }

      return; // Exit early after scheduling retry
    } else {
      // Max retries reached
      console.log(
        `Max retries (${BULK_INVITE_MAX_RETRIES}) reached for ${email}, marking as failed`,
      );
      await BulkInvite.updateOne(
        { _id: bulkInvite._id },
        { $inc: { failedCount: 1 } },
      );
      await checkAndCompleteBulkInvite(bulkInviteId);
    }
  }
};

async function checkAndCompleteBulkInvite(bulkInviteId: string) {
  // Load fresh data from database to avoid stale data from race conditions
  const bulkInvite = await BulkInvite.findById(bulkInviteId);

  if (!bulkInvite) {
    console.error(`BulkInvite ${bulkInviteId} not found`);
    return;
  }

  const validItems = bulkInvite.items.filter((i: any) => i.isValid);
  const processedCount = validItems.filter(
    (i: any) => i.emailSent || i.retryCount >= BULK_INVITE_MAX_RETRIES,
  ).length;

  if (processedCount === validItems.length) {
    bulkInvite.status = 'completed';
    bulkInvite.completedAt = new Date();
    await bulkInvite.save();
    console.log(`Bulk invite ${bulkInvite._id} completed`);

    // Send notification email to uploader
    await sendCompletionEmail(bulkInvite);
  }
}

async function sendCompletionEmail(bulkInvite: any) {
  try {
    const successCount = bulkInvite.sentCount;
    const failedCount = bulkInvite.failedCount;
    const invalidCount = bulkInvite.invalidCount;
    const hasErrors = failedCount > 0 || invalidCount > 0;

    // Determine which template to use
    const templatePath = hasErrors
      ? 'src/views/email/bulk_invite_complete_with_errors.html'
      : 'src/views/email/bulk_invite_complete_success.html';

    const template = fs.readFileSync(
      path.join(process.cwd(), templatePath),
      'utf8',
    );

    // Get link to admin app (completion emails always go to admin/superadmin)
    const link = getAppUrl('admin');

    // Prepare template data
    const templateData = {
      fileName: bulkInvite.fileName,
      successCount,
      failedCount,
      invalidCount,
      link,
    };

    const html = ejs.render(template, templateData);

    const subject = hasErrors
      ? 'Your user import is complete (with errors)'
      : 'Your user import is complete';

    await sendEmail({
      from: {
        name: NOTIFY_FROM_NAME,
        email: process.env.NOTIFY_EMAIL ?? '',
      },
      to: bulkInvite.uploadedByEmail,
      subject,
      html,
      text: html,
      category: EMAIL_CATEGORY.BULK_INVITE_COMPLETE,
    });

    console.log(
      `Sent completion email to ${bulkInvite.uploadedByEmail} for bulk invite ${bulkInvite._id}`,
    );
  } catch (error: any) {
    console.error('Error sending completion email:', error);
    // Don't throw error to avoid failing the job
  }
}
