import NextAuth from 'next-auth';
import type { NextAuthConfig, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import Resend from 'next-auth/providers/resend';
import type { JWT } from 'next-auth/jwt';
import { db } from './lib/prisma';

const config = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AppleProvider({
      clientId: process.env.AUTH_APPLE_ID as string,
      clientSecret: process.env.AUTH_APPLE_SECRET as string,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ account, profile, email }) {
      // DEBUG:
      console.log('signIn', account, profile, email);

      if (account?.provider === 'google' || account?.provider === 'apple') {
        const existingUser = profile?.email
          ? await db.user.findUnique({ where: { email: profile.email } })
          : null;

        // DEBUG:
        console.log('existingUser', existingUser);

        if (existingUser) {
          return true;
        }

        await db.user.create({
          data: {
            email: profile?.email as string,
            name: profile?.name as string,
          },
        });

        return true;
      }

      if (account?.provider === 'resend') {
        const userEmail = email?.toString();
        if (!userEmail) return false;

        const existingUser = await db.user.findUnique({
          where: { email: userEmail },
        });

        if (existingUser) {
          return true;
        }

        await db.user.create({
          data: {
            email: userEmail,
          },
        });

        return true;
      }

      return false;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const dbUser = token.email
        ? await db.user.findUnique({
            where: { email: token.email },
          })
        : null;

      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser?.id,
        },
      };
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
} satisfies NextAuthConfig;

// pass the config to NextAuth
export const {
  handlers,
  auth,
  signIn,
  signOut,
  // @ts-ignore - Type 'typeof import("next-auth")' has no call signatures
} = NextAuth(config);
