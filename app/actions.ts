'use server';

import { put } from '@vercel/blob';
import OpenAI from 'openai';
import { MAX_ATTEMPTS, REFERENCE_IMAGES } from '@/constants';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const { url, revised_prompt: revisedPrompt } = response.data[0];

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
  const generatedImages = [];

  // TODO: simplify the prompt as the attempt number increases
  // eslint-disable-next-line no-plusplus
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // eslint-disable-next-line no-await-in-loop
    const cleanedUpUserDescription = await cleanUpDescription(userDescription);
    // eslint-disable-next-line no-console
    console.log('cleanedUpUserDescription', cleanedUpUserDescription);

    // eslint-disable-next-line no-await-in-loop
    const image = await generateColoringImage(
      cleanedUpUserDescription as string,
    );

    // add generated image to the list of generated images
    generatedImages.push(image);

    imageUrl = image.url;
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
          content: `You are an assistant that helps determine if an image matches the user's description and the specified rules for generating coloring book images. The image should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Provide a response as a JSON object with 'accepted', 'reason', and 'prompt' keys. If the image is accepted, set 'accepted' to true, 'reason' to the explanation, and 'prompt' to null. If the image is not accepted, set 'accepted' to false, 'reason' to the explanation, and provide a refined prompt to generate an improved image. Ensure the image does not contain any extraneous elements or artifacts.`,
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

    // DEBUG:
    // eslint-disable-next-line no-console
    console.log('generatedImages', generatedImages);

    // TODO: if attempts is 3 e.g max attempts and this is still not accepted, compare the three images and select the best one
    if (attempt === MAX_ATTEMPTS - 1) {
      console.error('Failed to generate an acceptable image.');

      // TODO: compare the three images and select the best one
      // eslint-disable-next-line no-await-in-loop
      const chooseBestImageResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an assistant that helps determine the best image from a list of generated images. The images should be in cartoon style with thick lines, low detail, no color, no shading, and no fill. Only black lines should be used. Provide a response as a JSON object with an 'imageUrl' key. Set 'imageUrl' to the URL of the best image based on the user's description: "${cleanedUpUserDescription}".`,
          },
          {
            role: 'user',
            content: `Based on the following images, select the best one:`,
            ...generatedImages.map((generatedImage) => ({
              type: 'image_url',
              image_url: {
                url: generatedImage.url,
              },
            })),
          },
        ],
      });

      imageUrl = JSON.parse(
        chooseBestImageResponse.choices[0].message.content as string,
      ).imageUrl;
    }
  }

  if (!imageUrl) {
    throw new Error('Failed to generate an acceptable image');
  }

  // fetch image from url in a format suitable for saving in blob storage
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();
  const imageFileName = `uploads/coloring-images/${Date.now()}.webp`;

  // store generated coloring image in blob storage
  const putResponse = await put(imageFileName, imageBuffer, {
    access: 'public',
  });

  const generateImageMetaResponse = await openai.chat.completions.create({
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
            text: `Generate a JSON object with properties "title", "description" and "alt" for the generated image based on the following image:`,
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
    'generateImageMetaResponse gpt-4o message: ',
    JSON.stringify(generateImageMetaResponse.choices[0].message, null, 2),
  );

  const generateImageMetaResponseContent = JSON.parse(
    generateImageMetaResponse.choices[0].message.content as string,
  );

  // create new coloringImage in db
  const coloringImage = await prisma.coloringImage.create({
    data: {
      title: generateImageMetaResponseContent.title,
      description: generateImageMetaResponseContent.description,
      alt: generateImageMetaResponseContent.alt,
      blobUrl: putResponse.url,
      blobDownloadUrl: putResponse.downloadUrl,
    },
  });

  revalidatePath('/');

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
    orderBy: {
      createdAt: 'desc',
    },
  });
