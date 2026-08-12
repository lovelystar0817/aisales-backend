import sendgridMail, { MailDataRequired } from '@sendgrid/mail';
import { Client } from '@sendgrid/client';

export interface EmailSpec {
  from: {
    name: string;
    email: string;
  };
  text?: string;
  html?: string;
  subject?: string;
  to: string | string[];
  category?: string;
  templateId?: string;
  dynamicTemplateData?: any;
  bcc?: string[];
  cc?: string[];
  trackingId?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

export const EMAIL_CATEGORY = {
  INVITE_ADMIN: 'invite-admin',
  INVITE_USER: 'invite-user',
  UPDATE_ADMIN_ROLE: 'update-admin-role',
  BULK_INVITE_COMPLETE: 'bulk-invite-complete',
};

const getMailDataFromEmailSpec = (emailSpec: EmailSpec): any => {
  const {
    from,
    html,
    subject,
    to,
    category,
    templateId,
    dynamicTemplateData,
    bcc = [],
    cc = [],
    attachments,
  } = emailSpec;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const mailData: MailDataRequired = {
    from,
    html,
    subject,
    to,
    category,
    templateId,
    dynamicTemplateData,
    bcc,
    cc,
    attachments,
    mailSettings: {
      sandboxMode: {
        enable: process.env.NODE_ENV !== 'production',
      },
    },
  };
  return mailData;
};

export const configureEmail = (): void => {
  sendgridMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
};

export const sendEmail = async (
  emailSpec: EmailSpec | EmailSpec[],
): Promise<any> => {
  try {
    await sendgridMail.send(prepareMailData(emailSpec));
  } catch (err: any) {
    console.log('Error sending email', { error: err });
    throw err;
  }
};

const prepareMailData = (
  emailSpec: EmailSpec | EmailSpec[],
): MailDataRequired | MailDataRequired[] => {
  if (Array.isArray(emailSpec)) {
    return emailSpec.map((spec) => getMailDataFromEmailSpec(spec));
  } else if (Array.isArray(emailSpec.to)) {
    return emailSpec.to.map((email: string) => ({
      ...getMailDataFromEmailSpec(emailSpec),
      to: email,
    }));
  } else {
    return getMailDataFromEmailSpec(emailSpec);
  }
};

const printableEmailSpec = (emailSpec: EmailSpec | EmailSpec[]): string => {
  if (Array.isArray(emailSpec)) {
    return JSON.stringify(
      emailSpec.map((spec) => ({
        from: spec.from,
        to: spec.to,
        subject: spec.subject,
        category: spec.category,
      })),
    );
  } else {
    return JSON.stringify({
      from: emailSpec.from,
      to: emailSpec.to,
      subject: emailSpec.subject,
      category: emailSpec.category,
    });
  }
};

export const sendgridValidateEmailAsync = async (
  email: string,
): Promise<any> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  const client = new Client();
  client.setApiKey(process.env.SENDGRID_VALIDATOR_API_KEY ?? '');
  const data = {
    source: 'signup',
    email,
  };
  try {
    console.log('Validating email address: ' + email);
    const [response, body] = await client.request({
      method: 'POST',
      url: '/v3/validations/email',
      body: data,
    });
    const { statusCode } = response;
    const verdict = body?.result?.verdict;
    // stringify twice to escape string for logging
    const rawBody = JSON.stringify(JSON.stringify(body));
    console.log(
      'Email address validation result ' +
        `email="${email}" status=${statusCode} verdict=${verdict} body=${rawBody}`,
    );
    return verdict !== 'Invalid';
  } catch (err: any) {
    console.log('Error validating email', { error: err });
    return null;
  }
};
