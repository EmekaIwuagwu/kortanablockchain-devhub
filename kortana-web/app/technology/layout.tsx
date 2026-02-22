import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Technology",
    description:
        "Kortana's core technology: DPoH consensus, Quorlin/EVM dual VM, 2-second block times, 50,000+ TPS, Solaris propagation protocol, and BFT sub-2s finality on Chain ID 9002.",
    alternates: { canonical: "https://kortana.xyz/technology" },
    openGraph: {
        title: "Kortana Technology | DPoH Consensus and Quorlin VM",
        description:
            "Deep dive into Kortana's Delegated Proof-of-History, EVM compatibility, Quorlin VM, and Solaris propagation protocol.",
        url: "https://kortana.xyz/technology",
    },
};

export default function TechnologyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
