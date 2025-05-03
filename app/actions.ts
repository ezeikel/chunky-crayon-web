'use server';

import { put } from '@vercel/blob';
import { track } from '@vercel/analytics/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
// import { ChatCompletionContentPart } from 'openai/resources/index';
import QRCode from 'qrcode';
import potrace from 'oslllo-potrace';
import sharp from 'sharp';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { Resend } from 'resend';
import { Readable } from 'stream';
import {
  MAX_IMAGE_GENERATION_ATTEMPTS,
  NUMBER_OF_CONCURRENT_IMAGE_GENERATION_REQUESTS,
  REFERENCE_IMAGES,
} from '@/constants';
import prisma from '@/lib/prisma';
import { ColoringImage, GenerationType } from '@prisma/client';
import { getRandomDescription } from '@/utils/random';
import generatePDFNode from '@/utils/generatePDFNode';
import streamToBuffer from '@/utils/streamToBuffer';
import fetchSvg from '@/utils/fetchSvg';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER,
});

const resend = new Resend(process.env.RESEND_API_KEY as string);

// generate coloring image from openai based on text/audio/image description
const generateColoringImage = async (description: string) => {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${description}. The image should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Ensure no extraneous elements such as additional shapes or artifacts are included. Refer to the style of the provided reference images: ${REFERENCE_IMAGES.join(', ')}`,
    n: 1,
    size: '1024x1024',
    style: 'natural',
    quality: 'hd',
  });

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log('generateColoringImage response', response);

  const { url, revised_prompt: revisedPrompt } = (
    response.data as { url: string; revised_prompt: string }[]
  )[0];

  return {
    url,
    revisedPrompt,
  };
};

// generate an appropriate prompt for the coloring image
const cleanUpDescription = async (roughUserDescription: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
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

const sendEmail = async ({
  to,
  coloringImagePdf,
  generationType,
}: EmailData) => {
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

  return resend.emails.send({
    from: 'Chunky Crayon <no-reply@chunkycrayon.com>',
    to,
    subject: `${typeMap[generationType]} Coloring Image for ${dayName} ${day} ${month}`,
    text: 'Please find attached the coloring image for today',
    attachments: [
      {
        filename: `${typeMap[generationType].toLowerCase()}-coloring-image-${dayName}-${day}-${month}.pdf`,
        content: coloringImagePdf,
      },
    ],
  });
};

// TODO: improve this!
export const createColoringImage = async (formData: FormData) => {
  const rawFormData = {
    description: (formData.get('description') as string) || '',
    generationType:
      (formData.get('generationType') as GenerationType) || undefined,
  };

  // this is initially the user's description but can be updated based on the feedback from gpt-4o
  let userDescription = rawFormData.description;
  let imageUrl;

  // keep track of all generated images
  const allGeneratedImages: {
    url?: string;
    revisedPrompt?: string;
  }[] = [];

  // TODO: simplify the prompt as the attempt number increases
  // eslint-disable-next-line no-plusplus
  for (let attempt = 0; attempt < MAX_IMAGE_GENERATION_ATTEMPTS; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const cleanedUpUserDescription = await cleanUpDescription(userDescription);
    // eslint-disable-next-line no-console
    console.log('cleanedUpUserDescription', cleanedUpUserDescription);

    // generate images concurrently to speed up the process
    const generateImagePromises = Array.from(
      { length: NUMBER_OF_CONCURRENT_IMAGE_GENERATION_REQUESTS },
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      () => generateColoringImage(cleanedUpUserDescription as string),
    );

    // eslint-disable-next-line no-await-in-loop
    const generatedImages = await Promise.all(generateImagePromises);

    // add generated image to the list of generated images
    allGeneratedImages.push(...generatedImages);

    // DEBUG:
    // eslint-disable-next-line no-console
    console.log(
      'imageUrls',
      generatedImages.map((genImage) => genImage.url).join(', '),
    );

    // ask gpt-4o if the image is satisfactory
    // eslint-disable-next-line no-await-in-loop
    const checkImageAcceptanceResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an assistant that helps determine if images match the user's description and the specified rules for generating coloring book images. The image should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Provide a response as a JSON object with 'results', 'selectedImageUrl' and 'prompt' keys. 'results' should be an array of objects with each object representing the result of each of the ${NUMBER_OF_CONCURRENT_IMAGE_GENERATION_REQUESTS} images. The objects in the 'results' array should have 'accepted' and 'reason' keys. If the image is accepted, set 'accepted' to true, 'reason' to the explanation. If an image is not accepted, set 'accepted' to false, 'reason' to the explanation. If no images are accepted provide a refined prompt to generate an improved image under the 'prompt' property. If more than one image is accepted make a judgement call of which of the images fits the criteria the most and set its url as the 'selectedImageUrl. Ensure any accepted images do not contain any extraneous elements or artifacts.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Does any of the following images: ${generatedImages.map((genImage) => genImage.url).join(', ')} match the description and rules set out in the prompt: "${cleanedUpUserDescription}"?`,
            },
            // TODO: chatgpt doesn't seem to like the images being sent as an array of type image_url so appending to the text
            // ...generatedImages.map((image) => ({
            //   type: 'image_url',
            //   image_url: {
            //     url: image.url as string,
            //   },
            // })),
          ],
        },
      ],
    });

    const checkImageAcceptanceResponseContent = JSON.parse(
      checkImageAcceptanceResponse.choices[0].message.content as string,
    );

    // DEBUG:
    // eslint-disable-next-line no-console
    console.log(
      'checkImageAcceptanceResponseContent',
      checkImageAcceptanceResponseContent,
    );

    // if an image is accepted, set imageUrl to the selected image
    if (checkImageAcceptanceResponseContent.selectedImageUrl) {
      imageUrl = checkImageAcceptanceResponseContent.selectedImageUrl;
      break;
    }

    // if no image is accepted, update the user description based on the refined prompt
    userDescription = checkImageAcceptanceResponseContent.prompt;

    // DEBUG:
    // eslint-disable-next-line no-console
    console.log('allGeneratedImages', allGeneratedImages);

    // check if we have reached the maximum number of attempts
    if (attempt === MAX_IMAGE_GENERATION_ATTEMPTS - 1) {
      console.error('Failed to generate an acceptable image.');

      // ask gpt-4o to select the best image from the generated images
      // eslint-disable-next-line no-await-in-loop
      const chooseBestImageResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an assistant that helps determine the best image from a list of generated images. The images should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Provide a response as a JSON object with an 'imageUrl' key and a 'reason' key. Set 'imageUrl' to the URL of the best image based on the user's description: "${cleanedUpUserDescription}". Set 'reason' to the explanation for why the image was chosen.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Based on the following images, select the best one: ${allGeneratedImages.map((generatedImage) => generatedImage.url).join(', ')}`,
              },
              // TODO: chatgpt doesn't seem to like the images being sent as an array of type image_url so appending to the text
              // ...generatedImages.map(
              //   (generatedImage) =>
              //     ({
              //       type: 'image_url',
              //       image_url: {
              //         url: generatedImage.url,
              //       },
              //     }) as ChatCompletionContentPart,
              // ),
            ],
          },
        ],
      });

      // DEBUG:
      // eslint-disable-next-line no-console
      console.log(
        'chooseBestImageResponse gpt-4o message: ',
        JSON.stringify(chooseBestImageResponse.choices[0].message, null, 2),
      );

      imageUrl = JSON.parse(
        chooseBestImageResponse.choices[0].message.content as string,
      ).imageUrl;
    }

    // if no suitable image was generated, track the generated images and what chatgpt deemed as the most suitable image
    track(
      `Failed to generate an acceptable image within ${MAX_IMAGE_GENERATION_ATTEMPTS} attempts.`,
      {
        generatedImages: allGeneratedImages
          .map((generatedImage) => generatedImage.url)
          .join(', '),
        selectedImage: `Selected image is: ${imageUrl}. Reason is ${checkImageAcceptanceResponseContent.reason}`,
      },
    );
  }

  if (!imageUrl) {
    throw new Error('Failed to generate an acceptable image');
  }

  const generateImageMetadataResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
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
              url: imageUrl as string,
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
  const coloringImage = await prisma.coloringImage.create({
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
  const pngToSvg = async (buffer: ArrayBuffer): Promise<string> => {
    return new Promise((resolve, reject) => {
      sharp(buffer)
        .toFormat('png')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .toBuffer(async (err, pngBuffer) => {
          if (err) {
            reject(err);
          } else {
            const traced = await potrace(pngBuffer).trace();

            // TODO: handle error and reject Promise

            resolve(traced);
          }
        });
    });
  };

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
    // store generated coloring image in blob storage
    put(imageFileName, imageBuffer, {
      access: 'public',
    }),
    put(svgFileName, imageSvgBuffer, {
      access: 'public',
    }),
    // store generated coloring image in blob storage
    put(qrCodeFileName, qrCodeSvgBuffer, {
      access: 'public',
    }),
  ]);

  // update coloringImage in db with qr code url
  const updatedColoringImage = await prisma.coloringImage.update({
    where: {
      id: coloringImage.id,
    },
    data: {
      url: imageBlobUrl,
      svgUrl: imageSvgBlobUrl,
      qrCodeUrl: qrCodeSvgBlobUrl,
    },
  });

  revalidatePath('/');

  return updatedColoringImage;
};

export const getColoringImage = async (
  id: string,
): Promise<Partial<ColoringImage> | null> =>
  prisma.coloringImage.findUnique({
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
  prisma.coloringImage.findMany({
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
  await Promise.all(
    emails.map((email) =>
      sendEmail({
        to: email,
        coloringImagePdf: pdfBuffer,
        generationType,
      }),
    ),
  );

  return coloringImage;
};

type EmailData = {
  to: string;
  coloringImagePdf: Buffer;
  generationType: GenerationType;
};

export const generateColoringImageOfTheDay = async () => {
  return generateRandomColoringImage(GenerationType.DAILY);
};

export const generateColoringImageOfTheWeek = async () => {
  return generateRandomColoringImage(GenerationType.WEEKLY);
};

export const generateColoringImageOfTheMonth = async () => {
  return generateRandomColoringImage(GenerationType.MONTHLY);
};
