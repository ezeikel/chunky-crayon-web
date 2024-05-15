/* eslint-disable import/prefer-default-export */

'use server';

// import { headers } from 'next/headers';
// import { revalidatePath } from 'next/cache';
// import { del, put } from '@vercel/blob';
import OpenAI from 'openai';
// import Stripe from 'stripe';
// import { Resend } from 'resend';
// import { Readable } from 'stream';
// import prisma from '@/lib/prisma';
// import { auth } from '@/auth';
// import generatePDF from '@/utils/generatePDF';
// import streamToBuffer from '@/utils/streamToBuffer';
// import formatPenniesToPounds from '@/utils/formatPenniesToPounds';
import {
  CREATE_COLORING_PAGE_POST_PROMPT,
  CREATE_COLORING_PAGE_PRE_PROMPT,
} from '@/constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const resend = new Resend(process.env.RESEND_API_KEY);

// const stripe = new Stripe(process.env.STRIPE_SECRET!, {
//   apiVersion: '2024-04-10',
// });

export const createColoringPage = async (formData: FormData) => {
  const rawFormData = {
    text: (formData.get('text') as string) || '',
  };

  // generate coloring page from openai based on text/audio/image
  // TODO: Each image can be returned as either a URL or Base64 data, using the response_format parameter. URLs will expire after an hour.
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${CREATE_COLORING_PAGE_PRE_PROMPT} Here is the desciption of the image you need to create: ${rawFormData.text}. ${CREATE_COLORING_PAGE_POST_PROMPT}`,
    n: 1,
    size: '1024x1024',
  });

  const imageUrl = response.data[0].url;

  // generate pdf from image

  // create a new coloring page in the database

  return imageUrl;
};
