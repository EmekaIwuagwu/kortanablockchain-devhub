import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community",
    description:
        "Join the global Kortana community. Follow us on Twitter/X, join our Discord for developer discussions, contribute on GitHub, and participate in governance.",
    alternates: { canonical: "https://kortana.xyz/community" },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
