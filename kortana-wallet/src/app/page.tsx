'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const { address, _hasHydrated } = useWalletStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ background: '#0a0e27', height: '100vh' }} />;
  }

  // Purely for debugging: If we see this, then JS is running!
  return (
    <div style={{
      color: 'white',
      padding: '40px',
      textAlign: 'center',
      background: '#0a0e27',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Kortana Debug Screen</h1>
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'left', width: '300px' }}>
        <p><strong>JS Status:</strong> Active ✅</p>
        <p><strong>Hydrated:</strong> {_hasHydrated ? "Yes ✅" : "No ❌"}</p>
        <p><strong>Address:</strong> {address || "None"}</p>
      </div>
      <p style={{ marginTop: '20px', color: '#666', fontSize: '12px' }}>If you see this, React is mounting correctly.</p>
    </div>
  );
}
