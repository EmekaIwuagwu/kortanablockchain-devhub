'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Onboarding } from '@/components/Onboarding';
import { Dashboard } from '@/components/Dashboard';
import { SignRequest } from '@/components/views/SignRequest';
import { TransactionRequest } from '@/components/views/TransactionRequest';
import { NotificationOverlay } from '@/components/NotificationOverlay';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

export default function Home() {
  const { mnemonic, address, isLocked, _hasHydrated } = useWalletStore();
  const [mounted, setMounted] = useState(false);
  const [pendingSignRequest, setPendingSignRequest] = useState(false);
  const [pendingTxRequest, setPendingTxRequest] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (_hasHydrated && typeof chrome !== 'undefined' && chrome.storage?.session) {
      chrome.storage.session.get(['pendingSign', 'pendingTransaction'], (data: any) => {
        if (data.pendingSign?.status === 'pending') setPendingSignRequest(true);
        if (data.pendingTransaction?.status === 'pending') setPendingTxRequest(true);
      });
    }
  }, [_hasHydrated]);

  // Keep it pitch black until mounted and hydrated to avoid flashes
  if (!mounted || !_hasHydrated) {
    return <div style={{ background: '#0a0e27', height: '100vh', width: '100%' }} />;
  }

  const renderContent = () => {
    if (pendingTxRequest) return <TransactionRequest onDismiss={() => setPendingTxRequest(false)} />;
    if (pendingSignRequest) return <SignRequest onDismiss={() => setPendingSignRequest(false)} />;
    return address && mnemonic && !isLocked ? <Dashboard /> : <Onboarding />;
  };

  return (
    <MotionConfig reducedMotion="always">
      <NotificationOverlay />
      {renderContent()}
    </MotionConfig>
  );
}

