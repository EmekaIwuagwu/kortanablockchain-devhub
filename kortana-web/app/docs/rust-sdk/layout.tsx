import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rust SDK | Docs",
    description: "Develop performance-critical decentralized applications with the Kortana Rust SDK. High-fidelity bindings for industrial finance.",
    alternates: { canonical: "https://kortana.xyz/docs/rust-sdk" },
};

export default function DocRustSdkLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
