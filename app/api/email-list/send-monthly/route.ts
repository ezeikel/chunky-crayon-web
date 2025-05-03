/* eslint-disable import/prefer-default-export */

import { NextResponse } from 'next/server';
import { generateRandomColoringImage } from '@/app/actions';
import { GenerationType } from '@prisma/client';

export async function POST() {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.MONTHLY,
    );
    return NextResponse.json({ success: true, coloringImage });
  } catch (error) {
    console.error('Error in monthly email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate monthly email' },
      { status: 500 },
    );
  }
}
