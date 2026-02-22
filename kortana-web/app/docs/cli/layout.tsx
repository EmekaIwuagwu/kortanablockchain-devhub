import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kortana CLI | Docs",
    description: "Master the Kortana CLI. Use 'kortana-cli' for key management, deployments, and industrial-grade monitor scripts.",
    alternates: { canonical: "https://kortana.xyz/docs/cli" },
};

export default function CliLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
