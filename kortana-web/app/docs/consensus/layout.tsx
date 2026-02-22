import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DPoH Consensus | Docs",
    description: "Deep dive into Kortana's Delegated Proof-of-History (DPoH) and Byzantine Fault Tolerant (BFT) finality mechanism.",
    alternates: { canonical: "https://kortana.xyz/docs/consensus" },
};

export default function ConsensusLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
