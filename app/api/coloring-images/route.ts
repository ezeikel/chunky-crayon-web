/* eslint-disable import/prefer-default-export */

import { getAllColoringImages } from '@/app/actions';

export const GET = async () =>
  Response.json(
    { coloringImages: await getAllColoringImages() },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  );
