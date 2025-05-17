'use server';

import { put, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import QRCode from 'qrcode';
import potrace from 'oslllo-potrace';
import sharp from 'sharp';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { Readable } from 'stream';
import {
  OPENAI_MODEL_GPT_4O,
  OPENAI_MODEL_GPT_IMAGE_OPTIONS,
  REFERENCE_IMAGES,
  INSTAGRAM_CAPTION_PROMPT,
} from '@/constants';
import { db } from '@/lib/prisma';
import { ColoringImage, GenerationType } from '@prisma/client';
import { getRandomDescription } from '@/utils/random';
import generatePDFNode from '@/utils/generatePDFNode';
import streamToBuffer from '@/utils/streamToBuffer';
import fetchSvg from '@/utils/fetchSvg';
import { sendEmail } from '@/utils/email';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER,
});

// generate coloring image from openai based on text/audio/image description
const generateColoringImage = async (description: string) => {
  const response = await openai.images.generate({
    ...OPENAI_MODEL_GPT_IMAGE_OPTIONS,
    prompt: `${description}. The image should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Ensure no extraneous elements such as additional shapes or artifacts are included. Refer to the style of the provided reference images: ${REFERENCE_IMAGES.join(', ')}`,
  });

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log('generateColoringImage response', response);

  const { b64_json: base64Image } = (
    response.data as { b64_json: string }[]
  )[0];

  // convert base64 to buffer for storage
  const imageBuffer = Buffer.from(base64Image, 'base64');

  // generate a unique temporary filename
  const tempFileName = `temp/${Date.now()}-${Math.random().toString(36).substring(2)}.png`;

  try {
    // save the image to blob storage temporarily
    const { url } = await put(tempFileName, imageBuffer, {
      access: 'public',
    });

    return {
      url,
      tempFileName,
    };
  } catch (error) {
    console.error('Error saving temporary image:', error);
    throw error;
  }
};

// generate an appropriate prompt for the coloring image
const cleanUpDescription = async (roughUserDescription: string) => {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_4O,
    messages: [
      {
        role: 'system',
        content: `You are an assistant that helps clean up and simplify user descriptions for generating coloring book images for children. Ensure the description is suitable for a cartoon-style image with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. The target age is 3-8 years old. If the user's description does not include a scene or background, add an appropriate one. Consider the attached reference images: ${REFERENCE_IMAGES.join(', ')}. Do not include any extraneous elements in the description.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: roughUserDescription,
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content;
};

export const createColoringImage = async (formData: FormData) => {
  const rawFormData = {
    description: (formData.get('description') as string) || '',
    generationType:
      (formData.get('generationType') as GenerationType) || undefined,
  };

  // Clean up the user's description
  const cleanedUpUserDescription = await cleanUpDescription(
    rawFormData.description,
  );

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log('cleanedUpUserDescription', cleanedUpUserDescription);

  // Generate the coloring image
  const { url: imageUrl, tempFileName } = await generateColoringImage(
    cleanedUpUserDescription as string,
  );

  if (!imageUrl) {
    throw new Error('Failed to generate an acceptable image');
  }

  const generateImageMetadataResponse = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_4O,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an assistant that generates metadata for images to be used for SEO and accessibility. The metadata should include a title, a description, and an alt text for the image alt attribute. The information should be concise, relevant to the image, and suitable for children aged 3-8.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Generate a JSON object with properties "title", "description", "alt" and "tags" for the generated image based on the following image:`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
  });

  const generateImageMetadataResponseContent = JSON.parse(
    generateImageMetadataResponse.choices[0].message.content as string,
  );

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log(
    'generateImageMetadataResponseContent',
    generateImageMetadataResponseContent,
  );

  // create new coloringImage in db
  const coloringImage = await db.coloringImage.create({
    data: {
      title: generateImageMetadataResponseContent.title,
      description: generateImageMetadataResponseContent.description,
      alt: generateImageMetadataResponseContent.alt,
      tags: generateImageMetadataResponseContent.tags,
      generationType: rawFormData.generationType || GenerationType.USER,
    },
  });

  // generate qr code for the coloring image
  const qrCodeSvg = await QRCode.toString(
    `https://chunkycrayon.com?utm_source=${coloringImage.id}&utm_medium=pdf-qr-code&utm_campaign=coloring-image-pdf`,
    {
      type: 'svg',
    },
  );

  const qrCodeSvgBuffer = Buffer.from(qrCodeSvg);

  // fetch image from url in a format suitable for saving in blob storage
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();

  // convert png to svg using Potrace
  const pngToSvg = async (buffer: ArrayBuffer): Promise<string> =>
    new Promise((resolve, reject) => {
      sharp(buffer)
        .toFormat('png')
        .toBuffer(async (err, pngBuffer) => {
          if (err) {
            reject(err);
          } else {
            const traced = await potrace(pngBuffer).trace();
            resolve(traced);
          }
        });
    });

  const svg = await pngToSvg(imageBuffer);
  const imageSvgBuffer = Buffer.from(svg);

  // save image webp to blob storage
  const imageFileName = `uploads/coloring-images/${coloringImage.id}/image.webp`;

  // save image svg to blob storage
  const svgFileName = `uploads/coloring-images/${coloringImage.id}/image.svg`;

  // save qr code svg in blob storage
  const qrCodeFileName = `uploads/coloring-images/${coloringImage.id}/qr-code.svg`;

  const [
    { url: imageBlobUrl },
    { url: imageSvgBlobUrl },
    { url: qrCodeSvgBlobUrl },
  ] = await Promise.all([
    put(imageFileName, imageBuffer, {
      access: 'public',
    }),
    put(svgFileName, imageSvgBuffer, {
      access: 'public',
    }),
    put(qrCodeFileName, qrCodeSvgBuffer, {
      access: 'public',
    }),
  ]);

  // update coloringImage in db with qr code url
  const updatedColoringImage = await db.coloringImage.update({
    where: {
      id: coloringImage.id,
    },
    data: {
      url: imageBlobUrl,
      svgUrl: imageSvgBlobUrl,
      qrCodeUrl: qrCodeSvgBlobUrl,
    },
  });

  // Clean up temporary file
  try {
    if (tempFileName) {
      await del(tempFileName);
    }
  } catch (error) {
    console.error('Error cleaning up temporary file:', error);
  }

  revalidatePath('/');

  return updatedColoringImage;
};

export const getColoringImage = async (
  id: string,
): Promise<Partial<ColoringImage> | null> =>
  db.coloringImage.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      alt: true,
      tags: true,
      url: true,
      svgUrl: true,
      qrCodeUrl: true,
    },
  });

export const getAllColoringImages = async () =>
  db.coloringImage.findMany({
    select: {
      id: true,
      svgUrl: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

type JoinColoringPageEmailListState = {
  success: boolean;
  error?: unknown;
  email?: string;
};

export const joinColoringPageEmailList = async (
  previousState: JoinColoringPageEmailListState,
  formData: FormData,
): Promise<JoinColoringPageEmailListState> => {
  const rawFormData = {
    email: (formData.get('email') as string) || '',
  };

  try {
    await mailchimp.lists.addListMember(
      // process.env.MAILCHIMP_AUDIENCE_ID as string,
      '52c8855495',
      {
        email_address: rawFormData.email,
        status: 'subscribed',
      },
    );

    return {
      success: true,
      email: rawFormData.email,
    };
  } catch (error) {
    console.error({ mailchimpError: error });

    return {
      error: 'Failed to add email to mailchimp list',
      success: false,
    };
  }
};

export const getMailchimpAudienceMembers = async () => {
  const response = await mailchimp.lists.getListMembersInfo(
    // process.env.MAILCHIMP_AUDIENCE_ID as string,
    '52c8855495',
  );

  if ('members' in response) {
    return response.members;
  }

  throw new Error('Failed to get Mailchimp audience members');
};

export const generateRandomColoringImage = async (
  generationType: GenerationType,
): Promise<Partial<ColoringImage>> => {
  const description = getRandomDescription();

  const formData = new FormData();

  formData.append('description', description);
  formData.append('generationType', generationType);

  const coloringImage = await createColoringImage(formData);

  if (!coloringImage) {
    throw new Error(
      `Error generating ${generationType.toLowerCase()} coloring image`,
    );
  }

  const imageSvg = await fetchSvg(coloringImage.svgUrl as string);
  const qrCodeSvg = await fetchSvg(coloringImage.qrCodeUrl as string);

  const pdfStream = await generatePDFNode(coloringImage, imageSvg, qrCodeSvg);

  // convert PDF stream to buffer
  const pdfBuffer = await streamToBuffer(pdfStream as Readable);

  // get list of emails from mailchimp
  const members = await getMailchimpAudienceMembers();
  const emails: string[] = members.map(
    (member: { email_address: string }) => member.email_address,
  );

  // send email to all emails in the list with the coloring image as an attachment pdf
  await sendEmail({
    to: emails,
    coloringImagePdf: pdfBuffer,
    generationType,
  });

  return coloringImage;
};

export const generateColoringImageOfTheDay = async () =>
  generateRandomColoringImage(GenerationType.DAILY);

export const generateColoringImageOfTheWeek = async () =>
  generateRandomColoringImage(GenerationType.WEEKLY);

export const generateColoringImageOfTheMonth = async () =>
  generateRandomColoringImage(GenerationType.MONTHLY);

export const generateInstagramCaption = async (
  coloringImage: ColoringImage,
) => {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL_GPT_4O,
    messages: [
      {
        role: 'system',
        content: INSTAGRAM_CAPTION_PROMPT,
      },
      {
        role: 'user',
        content: `Generate an Instagram caption for this coloring page:
Title: ${coloringImage.title}
Description: ${coloringImage.description}
Tags: ${coloringImage.tags?.join(', ')}`,
      },
    ],
  });

  return response.choices[0].message.content;
};
