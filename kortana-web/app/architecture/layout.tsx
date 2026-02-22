import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Architecture",
    description:
        "Explore Kortana's 5-layer industrial blockchain architecture: Application, Consensus (DPoH), Execution (Dual VM), State, and Persistence. 2-second blocks and sub-2s finality.",
    alternates: { canonical: "https://kortana.xyz/architecture" },
};

export default function ArchitectureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
