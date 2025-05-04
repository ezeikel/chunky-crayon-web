import { getAllColoringImages, createColoringImage } from '@/app/actions';
import { MAX_IMAGE_GENERATION_TIME } from '@/constants';

export const maxDuration = MAX_IMAGE_GENERATION_TIME;

export const GET = async () =>
  Response.json(
    { coloringImages: await getAllColoringImages() },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
    },
  );

export const POST = async (request: Request) => {
  const { description } = await request.json();

  const formData = new FormData();
  formData.append('description', description);

  return Response.json(
    { coloringImage: await createColoringImage(formData) },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      },
    },
  );
};
