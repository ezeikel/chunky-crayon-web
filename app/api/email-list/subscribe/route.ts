/* eslint-disable import/prefer-default-export */

import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_SERVER,
});

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
    await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID as string,
      {
        email_address: email,
        status: 'subscribed',
      },
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
