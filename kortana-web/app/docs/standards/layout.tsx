import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Token Standards | Docs",
    description: "Learn about KIP-20 and KIP-721 token standards on Kortana. Fully EVM-compatible but optimized for industrial RWA tokenization.",
    alternates: { canonical: "https://kortana.xyz/docs/standards" },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
