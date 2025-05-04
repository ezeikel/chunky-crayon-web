import { NextResponse } from 'next/server';
import { GenerationType } from '@prisma/client';
import { generateRandomColoringImage } from '@/app/actions';

export const dynamic = 'force-dynamic';

export const maxDuration = 150;

export const POST = async () => {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.WEEKLY,
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
    console.error('Error in weekly email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly email' },
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
