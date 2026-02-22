import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Protocol Architecture | Docs",
    description: "Learn about the Kortana protocol architecture: Solaris networking, DPoH timing, Tower BFT consensus, Sealevel runtime, and Cloudbreak storage.",
    alternates: { canonical: "https://kortana.xyz/docs/architecture" },
};

export default function DocArchitectureLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
