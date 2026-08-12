import { Job } from '@hokify/agenda';
import { EMAIL_CATEGORY, sendEmail } from '../../utils/email.js';
import { NOTIFY_FROM_NAME } from '../../utils/constants.js';
import { getTranslation } from '../../locale/translation.js';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

type SendInvitationEmail = {
  email: string;
  link: string;
  languageCode: string;
  role: string;
  inviterEmail: string;
};

type Handler = (job: Job<SendInvitationEmail>) => Promise<void>;

export const sendInvitationEmail: Handler = async (job) => {
  const { email, link, languageCode, role, inviterEmail } =
    job.attrs.data ?? {};

  if (!email || !link) {
    throw new Error('Missing email or link');
  }

  const sendInviteTemplatePath = path.join(
    process.cwd(),
    `src/views/email/${role === 'user' ? 'invite_user' : 'invite_admin'}.html`,
  );

  try {
    const template = fs.readFileSync(sendInviteTemplatePath, 'utf8');

    const subject = getTranslation(
      languageCode,
      role === 'user'
        ? 'email.user_invitation_subject'
        : 'email.admin_invitation_subject',
      role === 'user'
        ? `You've been invited to join Hupo`
        : 'Invitation to access Hupo Admin App',
    );

    const payload: any = {
      link,
    };

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
  } catch (error: any) {
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};
