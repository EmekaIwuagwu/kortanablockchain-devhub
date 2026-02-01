# Kortana Blockchain Website

This is the official website for Kortana Blockchain, built with Next.js 16, React 19, and Tailwind CSS v4.

## Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the App Router pages.
  - `page.tsx`: Homepage
  - `architecture/`: Architecture page
  - `technology/`: Technology page
  - `developers/`: Developers portal
  - `network-status/`: Network status dashboard
  - `globals.css`: Global styles and Kortana Design System tokens.
- `components/`: Reusable UI components.
  - `landing/`: Components specific to the landing page (Hero, KeyMetrics, etc.).
  - `Navbar.tsx`: Main navigation.
  - `Footer.tsx`: Main footer.

## Design System

The project uses a custom Tailwind configuration defined in `app/globals.css` using the new `@theme` directive.
Key colors:
- Deep Space Black (`bg-deep-space`)
- Cyan Accent (`text-cyan-accent`)
- Electric Purple (`text-electric-purple`)

## Verification

The project has been built and verified successfully.
To build for production:
```bash
npm run build
```
