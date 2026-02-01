# Maintainer's Guide

This repository contains the source code for the Kortana Network website.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub
   cd kortana-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

The project uses the following environment variables (defined in `.env.local`):

- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect Project ID for RainbowKit.
- `FAUCET_API_URL`: URL for the faucet backend (if different from integrated mock).

## Deployment

The site is optimized for deployment on **Vercel**. 

1. Push changes to `main`.
2. Connect your repository to Vercel.
3. Configure environment variables.
4. Deployment is automatic.

## Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **3D Graphics**: Three.js + React Three Fiber
- **Web3**: Wagmi + RainbowKit + Viem
- **Icons**: Lucide React
- **UI Components**: Radix UI

## Testing

Run end-to-end tests using Playwright:
```bash
npx playwright test
```

## Rollback Plan

If a deployment fails:
1. Revert to the previous stable commit on the `main` branch.
2. Vercel will automatically redeploy the previous version.
3. Check Sentry logs for error details.
