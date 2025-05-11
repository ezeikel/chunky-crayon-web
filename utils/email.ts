import { Resend } from 'resend';
import { GenerationType } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY as string);

// Resend's default rate limit is 2 requests per second
const RATE_LIMIT_PER_SECOND = 2;
const RATE_LIMIT_DELAY = 1000 / RATE_LIMIT_PER_SECOND;

type EmailData = {
  to: string | string[];
  coloringImagePdf: Buffer;
  generationType: GenerationType;
};

const getEmailSubject = (generationType: GenerationType) => {
  const date = new Date();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  const typeMap: Record<GenerationType, string> = {
    [GenerationType.DAILY]: 'Daily',
    [GenerationType.WEEKLY]: 'Weekly',
    [GenerationType.MONTHLY]: 'Monthly',
    [GenerationType.USER]: 'Custom',
  };

  return `${typeMap[generationType]} Coloring Image for ${dayName} ${day} ${month}`;
};

const getEmailFilename = (generationType: GenerationType) => {
  const date = new Date();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });

  const typeMap: Record<GenerationType, string> = {
    [GenerationType.DAILY]: 'Daily',
    [GenerationType.WEEKLY]: 'Weekly',
    [GenerationType.MONTHLY]: 'Monthly',
    [GenerationType.USER]: 'Custom',
  };

  return `${typeMap[generationType].toLowerCase()}-coloring-image-${dayName}-${day}-${month}.pdf`;
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const sendSingleEmail = async (
  to: string,
  subject: string,
  filename: string,
  coloringImagePdf: Buffer,
) =>
  resend.emails.send({
    from: 'Chunky Crayon <no-reply@chunkycrayon.com>',
    to,
    subject,
    text: 'Please find attached the coloring image for today',
    attachments: [
      {
        filename,
        content: coloringImagePdf,
      },
    ],
  });

// eslint-disable-next-line import-x/prefer-default-export
export const sendEmail = async ({
  to,
  coloringImagePdf,
  generationType,
}: EmailData) => {
  const subject = getEmailSubject(generationType);
  const filename = getEmailFilename(generationType);

  // if to is a string, use single email send
  if (typeof to === 'string') {
    return sendSingleEmail(to, subject, filename, coloringImagePdf);
  }

  // WORKAROUND: Resend's batch API doesn't support attachments yet
  // https://resend.com/docs/dashboard/emails/attachments
  // Once they add support, we can switch to using resend.batch.send
  return to.reduce<Promise<unknown[]>>(async (promise, recipient, index) => {
    const results = await promise;
    if (index > 0) {
      await sleep(RATE_LIMIT_DELAY);
    }
    const result = await sendSingleEmail(
      recipient,
      subject,
      filename,
      coloringImagePdf,
    );
    return [...results, result];
  }, Promise.resolve([]));
};
