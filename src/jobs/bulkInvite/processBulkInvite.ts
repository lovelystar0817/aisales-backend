import { Job } from '@hokify/agenda';
import { BulkInvite } from '../../models/BulkInvite.js';
import { getAgenda } from '../agenda.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';

type ProcessBulkInviteData = {
  bulkInviteId: string;
};

type Handler = (job: Job<ProcessBulkInviteData>) => Promise<void>;

export const processBulkInvite: Handler = async (job) => {
  const { bulkInviteId } = job.attrs.data ?? {};

  if (!bulkInviteId) {
    throw new Error('Missing bulkInviteId');
  }

  try {
    const bulkInvite = await BulkInvite.findById(bulkInviteId);

    if (!bulkInvite) {
      throw new Error(`BulkInvite ${bulkInviteId} not found`);
    }

    // Process only valid items
    const validItems = bulkInvite.items.filter((item) => item.isValid);

    if (validItems.length === 0) {
      bulkInvite.status = 'completed';
      bulkInvite.completedAt = new Date();
      await bulkInvite.save();
      return;
    }

    // Schedule individual email jobs
    const agenda = getAgenda();
    for (const item of validItems) {
      await agenda.now(AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL, {
        bulkInviteId: bulkInvite._id.toString(),
        email: item.email,
        role: item.role,
        teamNames: item.teamNames,
        companyId: bulkInvite.company.toString(),
        inviterEmail: bulkInvite.uploadedByEmail,
      });
    }

    console.log(
      `Scheduled ${validItems.length} email jobs for bulk invite ${bulkInviteId}`,
    );
  } catch (error: any) {
    console.error('Error processing bulk invite:', error);
    throw error;
  }
};
