/* eslint-disable import/prefer-default-export */

import { NextResponse } from 'next/server';
import { generateRandomColoringImage } from '@/app/actions';
import { GenerationType } from '@prisma/client';

export const dynamic = 'force-dynamic';

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const POST = async () => {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.DAILY,
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
    console.error('Error in daily email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily email' },
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
