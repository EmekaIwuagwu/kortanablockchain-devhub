import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Network Status",
    description:
        "Real-time health of the Kortana Blockchain. Monitor block height, transactions per second (TPS), average block time, and validator operational status.",
    alternates: { canonical: "https://kortana.xyz/network-status" },
};

export default function NetworkStatusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
