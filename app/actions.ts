'use server';

import { put } from '@vercel/blob';
import { track } from '@vercel/analytics/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
// import { ChatCompletionContentPart } from 'openai/resources/index';
import QRCode from 'qrcode';
import potrace from 'oslllo-potrace';
import sharp from 'sharp';
import {
  MAX_IMAGE_GENERATION_ATTEMPTS,
  NUMBER_OF_CONCURRENT_IMAGE_GENERATION_REQUESTS,
  REFERENCE_IMAGES,
} from '@/constants';
import prisma from '@/lib/prisma';
import { ColoringImage } from '@prisma/client';

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

  return response.choices[0].message.content;
};

export const createColoringImage = async (formData: FormData) => {
  const rawFormData = {
    description: (formData.get('description') as string) || '',
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
  await prisma.coloringImage.update({
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

  return coloringImage;
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
