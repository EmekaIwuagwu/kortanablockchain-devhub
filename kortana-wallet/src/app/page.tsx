'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { useEffect, useState } from 'react';

export default function Home() {
  const { mnemonic, address, isLocked } = useWalletStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <main>
      {address && mnemonic && !isLocked ? (
        <Dashboard />
      ) : (
        <Onboarding />
      )}
    </main>
  );
}
