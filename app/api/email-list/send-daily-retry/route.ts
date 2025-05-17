import { NextResponse } from 'next/server';
import { GenerationType } from '@prisma/client';
import { db } from '@/lib/prisma';
import fetchSvg from '@/utils/fetchSvg';
import generatePDFNode from '@/utils/generatePDFNode';
import { Readable } from 'stream';
import streamToBuffer from '@/utils/streamToBuffer';
import { sendEmail } from '@/utils/email';

export const dynamic = 'force-dynamic';

export const maxDuration = 150;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const handleRequest = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const emails = searchParams.get('emails');

    if (!emails) {
      return NextResponse.json(
        { error: 'No emails provided' },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const emailList = emails.split(',').map((email) => email.trim());

    // get the most recent daily coloring image
    const coloringImage = await db.coloringImage.findFirst({
      where: {
        generationType: GenerationType.DAILY,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!coloringImage?.svgUrl || !coloringImage?.qrCodeUrl) {
      return NextResponse.json(
        { error: 'No recent daily coloring image found' },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const imageSvg = await fetchSvg(coloringImage.svgUrl);
    const qrCodeSvg = await fetchSvg(coloringImage.qrCodeUrl);

    const pdfStream = await generatePDFNode(coloringImage, imageSvg, qrCodeSvg);
    const pdfBuffer = await streamToBuffer(pdfStream as Readable);

    // send email to all emails in the list
    await sendEmail({
      to: emailList,
      coloringImagePdf: pdfBuffer,
      generationType: GenerationType.DAILY,
    });

    return NextResponse.json(
      { success: true, emailsSent: emailList },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error('Error in daily email retry:', error);
    return NextResponse.json(
      { error: 'Failed to send daily email retry' },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};

export const GET = handleRequest;
export const POST = handleRequest;
