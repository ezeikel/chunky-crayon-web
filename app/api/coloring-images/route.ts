/* eslint-disable import/prefer-default-export */

import { getAllColoringImages } from '@/app/actions';

export const GET = async () =>
  Response.json({ coloringImages: await getAllColoringImages() });
