/* eslint-disable import/prefer-default-export */

import { getColoringImage } from '@/app/actions';

export const GET = async (
  request: Request,
  { params }: { params: { id: string } },
) => {
  const { id } = params;

  return Response.json({ coloringImage: await getColoringImage(id) });
};
