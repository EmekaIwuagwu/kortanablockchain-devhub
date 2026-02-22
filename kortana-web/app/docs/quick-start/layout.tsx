import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quick Start | Docs",
    description: "Start building on Kortana in 5 minutes. Learn how to configure Hardhat and deploy your first smart contract.",
    alternates: { canonical: "https://kortana.xyz/docs/quick-start" },
};

export default function QuickStartLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
