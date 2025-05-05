import { NextResponse } from 'next/server';
import { GenerationType } from '@prisma/client';
import { generateRandomColoringImage } from '@/app/actions';

export const dynamic = 'force-dynamic';

export const maxDuration = 150;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const handleRequest = async () => {
  try {
    const coloringImage = await generateRandomColoringImage(
      GenerationType.WEEKLY,
    );
    return NextResponse.json(
      { success: true, coloringImage },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error('Error in weekly email generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly email' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};

// vercel Cron Jobs only work with GET requests
export const GET = handleRequest;
export const POST = handleRequest;
