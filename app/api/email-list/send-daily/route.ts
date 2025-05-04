import { NextResponse } from 'next/server';
import { GenerationType } from '@prisma/client';
import { generateRandomColoringImage } from '@/app/actions';

export const dynamic = 'force-dynamic';

export const maxDuration = 150;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const POST = async () => {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.DAILY,
    );
    return NextResponse.json(
      { success: true, coloringImage },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error('Error in daily email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily email' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};
