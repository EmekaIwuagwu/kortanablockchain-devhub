import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Use Outfit as requested in brief
import "./globals.css";
import { Web3Provider } from "@/context/Web3Provider";
import { Header } from "@/components/layout/Header";
import { CustomCursor } from "@/components/ui/CustomCursor";

const outfit = Outfit({
    subsets: ["latin"],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: "KORTANA | The Future of High-Frequency Blockchain",
    description: "A hyper-performance Layer 1 execution engine built for light-speed decentralized applications.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${outfit.variable} font-sans bg-[#020408] text-white antialiased selection:bg-purple-500/30 selection:text-white`}>
                <div className="mesh-bg">
                    <div className="mesh-orb-1" />
                    <div className="mesh-orb-2" />
                </div>

                <Web3Provider>
                    <CustomCursor />
                    <div className="flex flex-col min-h-screen relative z-10">
                        <Header />
                        <main className="flex-grow">
                            {children}
                        </main>
                    </div>
                </Web3Provider>
            </body>
        </html>
    );
}
