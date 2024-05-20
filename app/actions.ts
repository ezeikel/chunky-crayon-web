/* eslint-disable import/prefer-default-export */

'use server';

import { put } from '@vercel/blob';
import OpenAI from 'openai';
import { MAX_ATTEMPTS, REFERENCE_IMAGES } from '@/constants';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// generate coloring page from openai based on text/audio/image
// TODO: Each image can be returned as either a URL or Base64 data, using the response_format parameter. URLs will expire after an hour.
const generateColoringImage = async (description: string) => {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${description}. The image should be in cartoon style with thick lines, low detail, no color, and no shading. Ensure no extraneous elements such as additional shapes or artifacts are included. Refer to the style of the provided reference images: ${REFERENCE_IMAGES.join(', ')}`,
    n: 1,
    size: '1024x1024',
    style: 'natural',
    quality: 'hd',
  });

  return response.data[0].url;
};

// generate an appropriate prompt for the coloring page
const cleanUpDescription = async (roughUserDescription: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an assistant that helps clean up and simplify user descriptions for generating coloring book images for children. Ensure the description is suitable for a cartoon-style image with thick lines, low detail, no color, and no shading. The target age is 3-8 years old. If the user's description does not include a scene or background, add an appropriate one. Consider the attached reference images: ${REFERENCE_IMAGES.join(', ')}. Do not include any extraneous elements in the description.`,
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

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log(
    'generatedPromptResponse gpt-4o message: ',
    JSON.stringify(response.choices[0].message, null, 2),
  );

  return response.choices[0].message.content;
};

export const createColoringImage = async (formData: FormData) => {
  const rawFormData = {
    description: (formData.get('description') as string) || '',
  };

  // this is initially the user's description but can be updated based on the feedback from gpt-4o
  let userDescription = rawFormData.description;
  let imageUrl;

  // TODO: simplify the prompt as the attempt number increases
  // eslint-disable-next-line no-plusplus
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const cleanedUpUserDescription = await cleanUpDescription(userDescription);
    // eslint-disable-next-line no-console
    console.log('cleanedUpUserDescription', cleanedUpUserDescription);

    // eslint-disable-next-line no-await-in-loop
    imageUrl = await generateColoringImage(cleanedUpUserDescription as string);
    // eslint-disable-next-line no-console
    console.log('imageUrl', imageUrl);

    // ask gpt-4o if the image is satisfactory
    // eslint-disable-next-line no-await-in-loop
    const checkImageAcceptanceResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an assistant that helps determine if an image matches the user's description and the specified rules for generating coloring book images. The image should be in cartoon style with thick lines, low detail, no color, and no shading. Provide a response as a JSON object with 'accepted', 'reason', and 'prompt' keys. If the image is accepted, set 'accepted' to true, 'reason' to the explanation, and 'prompt' to null. If the image is not accepted, set 'accepted' to false, 'reason' to the explanation, and provide a refined prompt to generate an improved image. Ensure the image does not contain any extraneous elements or artifacts.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Does this image match the description and rules set out in the prompt: "${cleanedUpUserDescription}"?`,
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

    // DEBUG:
    // eslint-disable-next-line no-console
    console.log(
      'checkImageAcceptanceResponse gpt-4o message: ',
      JSON.stringify(
        checkImageAcceptanceResponse.choices[0].message.content,
        null,
        2,
      ),
    );

    const checkImageAcceptanceResponseContent = JSON.parse(
      checkImageAcceptanceResponse.choices[0].message.content as string,
    );

    if (checkImageAcceptanceResponseContent.accepted) {
      break;
    }

    userDescription = checkImageAcceptanceResponseContent.prompt;
  }

  if (!imageUrl) {
    throw new Error('Failed to generate an acceptable image');
  }

  // TODO: if attempts is 3 e.g max attempts and this is still not accepted, compare the three images and select the best one

  // fetch image from url in a format suitable for saving in blob storage
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();
  const imageFileName = `uploads/coloring-images/${Date.now()}.webp`;

  // store generated coloring image in blob storage
  const putResponse = await put(imageFileName, imageBuffer, {
    access: 'public',
  });

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log('putResponse', putResponse);

  // create new coloringImage in db
  const coloringImage = await prisma.coloringImage.create({
    data: {
      title: 'Coloring Image title',
      description: 'Coloring Image description',
      alt: 'Coloring Image alt',
      blobUrl: putResponse.url,
      blobDownloadUrl: putResponse.downloadUrl,
    },
  });

  // DEBUG:
  // eslint-disable-next-line no-console
  console.log('coloringImage', coloringImage);

  return coloringImage;
};

export const getColoringImage = async (id: string) =>
  prisma.coloringImage.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      alt: true,
      blobUrl: true,
      blobDownloadUrl: true,
      pdfUrl: true,
    },
  });

export const getAllColoringImages = async () =>
  prisma.coloringImage.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      alt: true,
      blobUrl: true,
      blobDownloadUrl: true,
      pdfUrl: true,
    },
  });
