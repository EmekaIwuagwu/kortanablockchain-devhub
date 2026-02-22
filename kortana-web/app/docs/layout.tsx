import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Industrial Developer Portal",
    description:
        "The complete technical resource for building on Kortana. Access smart contract standards (KIP-20, KIP-721), Rust SDK, JSON-RPC 2.0 API reference, and validator node setup guides.",
    alternates: { canonical: "https://kortana.xyz/docs" },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
