/* eslint-disable import/prefer-default-export */

import { joinColoringPageEmailList } from '@/app/actions';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json(
      { error: 'Email is required' },
      {
        status: 400,
      },
    );
  }

  try {
    const formData = new FormData();
    formData.append('email', email);

    await joinColoringPageEmailList(
      {
        success: false,
      },
      formData,
    );

    return Response.json(
      { result: 'Successfully added to the list.' },
      {
        status: 200,
      },
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to add to the list', details: error },
      {
        status: 500,
      },
    );
  }
}
