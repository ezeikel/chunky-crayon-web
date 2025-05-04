import { NextResponse } from 'next/server';
import { GenerationType } from '@prisma/client';
import { generateRandomColoringImage } from '@/app/actions';
import { MAX_IMAGE_GENERATION_TIME } from '@/constants';

export const dynamic = 'force-dynamic';

export const maxDuration = MAX_IMAGE_GENERATION_TIME;

export const POST = async () => {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.MONTHLY,
    );
    return NextResponse.json(
      { success: true, coloringImage },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    console.error('Error in monthly email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly email' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  }
};
