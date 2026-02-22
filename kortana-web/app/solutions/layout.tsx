import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Industrial Solutions",
    description:
        "Industrial-grade blockchain solutions for global credit markets, RWA tokenization (Manhattan RE Bond), and supply chain integrity. High-throughput, compliant, and transparent.",
    alternates: { canonical: "https://kortana.xyz/solutions" },
};

export default function SolutionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
