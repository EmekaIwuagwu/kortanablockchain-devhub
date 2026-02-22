import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Network Config | Docs",
    description: "Access RPC endpoints, Chain IDs, and explorer URLs for Kortana Mainnet Beta and Poseidon Testnet.",
    alternates: { canonical: "https://kortana.xyz/docs/network" },
};

export default function DocNetworkLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
