import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "JSON-RPC API | Docs",
    description: "Complete JSON-RPC 2.0 API reference for the Kortana Blockchain. Fully compatible with standard Ethereum execution and development tools.",
    alternates: { canonical: "https://kortana.xyz/docs/api" },
};

export default function ApiLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
