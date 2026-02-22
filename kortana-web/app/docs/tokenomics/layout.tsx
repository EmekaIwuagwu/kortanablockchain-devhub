import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DNR Tokenomics | Docs",
    description: "DNR token utility, fixed 500B supply, genesis circulation, and deflationary burn mechanisms.",
    alternates: { canonical: "https://kortana.xyz/docs/tokenomics" },
};

export default function TokenomicsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
