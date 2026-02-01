'use client';

import PageHeader from "@/components/PageHeader";
import Link from 'next/link';
import DocsSidebar from "@/components/DocsSidebar";
import { Copy, Terminal, Server, Code2, Wrench, Search, ArrowRight, CheckCircle2 } from "lucide-react";

export default function QuickStartPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <PageHeader
                title="Quick Start"
                subtitle="The 5-minute guide to deploying your first transaction."
            />

            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16 relative z-10">
                <DocsSidebar />

                <div className="flex-1 space-y-20">

                    {/* Welcome Section */}
                    <section>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-8 italic">Welcome to the Speed of Light.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                            This guide will walk you through setting up your environment, obtaining testnet funds, and deploying your first smart contract to the Kortana Poseidon Testnet.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <RequirementItem text="Node.js 18.x or higher" />
                            <RequirementItem text="MetaMask Wallet extension" />
                            <RequirementItem text="Basic Solidity knowledge" />
                            <RequirementItem text="DNR Testnet tokens" />
                        </div>
                    </section>

                    {/* Step 1 */}
                    <section>
                        <StepHeader number="01" title="Initialize Environment" />
                        <p className="text-gray-400 mb-8 font-medium">Create a new directory and initialize a Hardhat project with the Kortana runtime dependencies.</p>
                        <CodeBlock
                            commands={[
                                "mkdir kortana-app && cd kortana-app",
                                "npm init -y",
                                "npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox"
                            ]}
                        />
                    </section>

                    {/* Step 2 */}
                    <section>
                        <StepHeader number="02" title="Protocol Configuration" />
                        <p className="text-gray-400 mb-8 font-medium">Map your Hardhat config to the Poseidon Testnet RPC endpoints.</p>
                        <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-black/40 mb-8">
                            <pre className="text-xs text-cyan-400/80 font-mono leading-relaxed">
                                {`module.exports = {
  solidity: "0.8.19",
  networks: {
    kortana: {
      url: "https://poseidon-rpc.kortana.name.ng",
      accounts: [YOUR_PRIVATE_KEY],
      chainId: 72511
    }
  }
};`}
                            </pre>
                        </div>
                    </section>

                    {/* Step 3 */}
                    <section>
                        <StepHeader number="03" title="Deploy & Monitor" />
                        <p className="text-gray-400 mb-8 font-medium">Deploy your contract and verify it on our industrial explorer.</p>
                        <CodeBlock
                            commands={[
                                "npx hardhat run scripts/deploy.js --network kortana"
                            ]}
                        />
                        <div className="mt-12 p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <Search className="text-cyan-400" size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">Pro Tip</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">You can track your deployment live on the <Link href="/network-status" className="text-cyan-400 hover:underline">Network Status</Link> dashboard or use our CLI and `kortana-monitor` command.</p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    )
}

function RequirementItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <CheckCircle2 size={16} className="text-cyan-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{text}</span>
        </div>
    )
}

function StepHeader({ number, title }: { number: string, title: string }) {
    return (
        <div className="flex items-center gap-6 mb-8">
            <div className="text-5xl font-black text-white/5 tracking-tighter">{number}</div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h3>
            <div className="flex-1 h-[1px] bg-white/5"></div>
        </div>
    )
}

function CodeBlock({ commands }: { commands: string[] }) {
    return (
        <div className="glass-panel rounded-[2rem] border-white/5 bg-black/60 p-8 relative group">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-red-400/40"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/40"></div>
                <div className="w-2 h-2 rounded-full bg-green-400/40"></div>
            </div>
            <div className="space-y-4 font-mono text-sm">
                {commands.map((cmd, i) => (
                    <div key={i} className="flex gap-4">
                        <span className="text-gray-700 select-none">$</span>
                        <span className="text-gray-300">{cmd}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
