import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Introduction | Docs",
    description: "Learn about the Kortana Blockchain, its industrial-scale vision, and how it compares to legacy L1s in throughput and finality.",
    alternates: { canonical: "https://kortana.xyz/docs/introduction" },
};

export default function IntroLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
