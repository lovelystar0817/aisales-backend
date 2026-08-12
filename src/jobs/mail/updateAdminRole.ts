import { Job } from '@hokify/agenda';
import { EMAIL_CATEGORY, sendEmail } from '../../utils/email.js';
import { NOTIFY_FROM_NAME } from '../../utils/constants.js';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

type SendUpdateRoleEmail = {
  email: string;
  previousRole: string;
  newRole: string;
  link: string;
};

type Handler = (job: Job<SendUpdateRoleEmail>) => Promise<void>;

const roleDisplayNames: Record<string, string> = {
  user: 'User',
  admin: 'Admin',
  superadmin: 'Superadmin',
};

export const sendUpdateRoleEmail: Handler = async (job) => {
  const { email, previousRole, newRole, link } = job.attrs.data ?? {};

  if (!email || !previousRole || !newRole || !link) {
    throw new Error(
      'Missing required fields: email, previousRole, newRole, or link',
    );
  }

  const templatePath = path.join(
    process.cwd(),
    'src/views/email/update_admin_role.html',
  );

  try {
    const template = fs.readFileSync(templatePath, 'utf8');

    const subject = 'Your Hupo Admin Access Has Been Updated';

    const html = ejs.render(template, {
      previousRole: roleDisplayNames[previousRole] || previousRole,
      newRole: roleDisplayNames[newRole] || newRole,
      link,
    });

    await sendEmail({
      from: {
        name: NOTIFY_FROM_NAME,
        email: process.env.NOTIFY_EMAIL ?? '',
      },
      to: email,
      subject,
      html,
      text: html,
      category: EMAIL_CATEGORY.UPDATE_ADMIN_ROLE,
    });
  } catch (error: any) {
    console.error('Error sending update role email:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};
