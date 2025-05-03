/* eslint-disable import/prefer-default-export */

import { NextResponse } from 'next/server';
import { generateRandomColoringImage } from '@/app/actions';
import { GenerationType } from '@prisma/client';

export async function POST() {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.DAILY,
    );
    return NextResponse.json({ success: true, coloringImage });
  } catch (error) {
    console.error('Error in daily email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily email' },
      { status: 500 },
    );
  }
}
