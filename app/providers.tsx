'use client';

import { SessionProvider } from 'next-auth/react';
import { ColoringContextProvider } from '@/contexts/coloring';

const Providers = ({ children }: { children: React.ReactNode }) => {
  // TODO: skipping auth for now
  return <ColoringContextProvider>{children}</ColoringContextProvider>;

  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
