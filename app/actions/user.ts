'use server';

import { auth } from '@/auth';
import { ACTIONS } from '@/constants';
import { db, User } from '@/lib/prisma';

export const getUserId = async (action?: string) => {
  const session = await auth();

  const userId = session?.user.id;

  if (action === ACTIONS.GET_CURRENT_USER) {
    return userId;
  }

  if (!userId) {
    console.error(
      `You need to be logged in to ${action || 'perform this action'}.`,
    );
    return null;
  }

  return userId;
};

export const getCurrentUser = async (): Promise<Partial<User> | null> => {
  const userId = await getUserId(ACTIONS.GET_CURRENT_USER);

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
    },
  });

  return user;
};
