'use client'

import React from 'react'
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
    Theme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { kortanaTestnet } from '@/lib/chains'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
    appName: 'Kortana Network',
    projectId: '071a073f98295a70656a8e32c0d8ac9b', // Public demo ID
    chains: [kortanaTestnet],
    ssr: true,
})

const queryClient = new QueryClient()

const customTheme: Theme = darkTheme({
    accentColor: '#2EA3FF',
    accentColorForeground: 'white',
    borderRadius: 'medium',
    fontStack: 'system',
    overlayBlur: 'small',
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={customTheme}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
