'use client';

import { SessionProvider } from 'next-auth/react';

const Providers = ({ children }: { children: React.ReactNode }) => {
  // TOOD: skipping auth for now
  return children;

  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
