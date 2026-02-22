import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Whitepaper",
    description: "Read the Kortana technical whitepaper. Detailed specification of DPoH consensus, Solaris networking, and the 500B DNR industrial tokenomics model.",
    alternates: { canonical: "https://kortana.xyz/whitepaper" },
};

export default function WhitepaperLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
