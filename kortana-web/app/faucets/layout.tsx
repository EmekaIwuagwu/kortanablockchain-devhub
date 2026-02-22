import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Faucets",
    description:
        "Get testnet DNR tokens for free. Use the Kortana Faucet to fund your wallet on Poseidon Testnet (Chain ID 72511) or Devnet and start building industrial DApps today.",
    alternates: { canonical: "https://kortana.xyz/faucets" },
};

export default function FaucetsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
