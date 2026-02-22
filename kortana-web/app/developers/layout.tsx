import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Developers",
    description:
        "Build on Kortana Mainnet (Chain ID 9002) — EVM-compatible Solidity contracts, RPC integration, Rust SDK, and the Quorlin VM. Mainnet RPC: zeus-rpc.mainnet.kortana.xyz.",
    alternates: { canonical: "https://kortana.xyz/developers" },
    openGraph: {
        title: "Kortana Developer Portal | Build on Chain ID 9002",
        description:
            "Deploy Solidity contracts on Kortana Mainnet (Chain ID 9002). EVM-compatible, 2s blocks, 50,000+ TPS. Full RPC and SDK documentation.",
        url: "https://kortana.xyz/developers",
    },
};

export default function DevelopersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
