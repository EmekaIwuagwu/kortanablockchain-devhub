import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { PieChart, Zap, HandCoins, Lock, TrendingUp, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Tokenomics",
    description:
        "Kortana DNR token economics: 500 Billion total supply, EIP-1559 deflationary burning, staking rewards, and governance. Chain ID 9002.",
    alternates: { canonical: "https://kortana.xyz/tokenomics" },
    openGraph: {
        title: "Kortana Tokenomics | DNR Token Economics",
        description: "500B DNR total supply, deflationary burning, staking, governance. Built on Kortana Mainnet Chain ID 9002.",
        url: "https://kortana.xyz/tokenomics",
    },
};

export default function TokenomicsPage() {
    return (
        <div className="min-h-screen bg-deep-space pb-20">
            <PageHeader
                title="Token Economics"
                subtitle="Sustainable, Deflationary, and Validator-Centric"
            />

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Key Metric Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
                    <StatBox label="Total Supply" value="500,000,000,000" sub="DNR" />
                    <StatBox label="Foundation Reserve" value="490,000,000,000" sub="DNR" />
                    <StatBox label="Inflation Rate" value="4.2%" sub="Decreasing" />
                    <StatBox label="Burned (Total)" value="2,400,129" sub="DNR" color="orange" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                            <PieChart className="text-cyan-400" />
                            Initial Distribution
                        </h2>
                        <div className="space-y-4">
                            <DistributionItem color="bg-cyan-500" percent="40%" label="Ecosystem & Community Rewards" />
                            <DistributionItem color="bg-purple-500" percent="20%" label="Core Team & Contributors (4yr Vesting)" />
                            <DistributionItem color="bg-blue-500" percent="15%" label="Foundation Reserve" />
                            <DistributionItem color="bg-green-500" percent="15%" label="Early Backers & Investors" />
                            <DistributionItem color="bg-yellow-500" percent="10%" label="Public Sale & Airdrops" />
                        </div>

                        <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="text-gray-400 w-5 h-5" /> Vesting Schedule
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Team and Investor tokens are subject to a strict linear vesting schedule over 4 years with a 1-year cliff. This ensures long-term alignment with the protocol's success.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <Zap className="text-neon-green" />
                                Utility & Governance
                            </h2>
                            <ul className="space-y-6">
                                <UtilityItem
                                    title="Gas Fees"
                                    desc="DNR is used to pay for transaction execution and smart contract storage."
                                />
                                <UtilityItem
                                    title="Staking Security"
                                    desc="Validators stake DNR to secure the network. Honest behavior is rewarded; malicious behavior is slashed."
                                />
                                <UtilityItem
                                    title="Governance"
                                    desc="DNR holders can propose and vote on protocol upgrades and parameter changes."
                                />
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <TrendingUp className="text-orange-400" />
                                Deflationary Mechanics
                            </h2>
                            <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-900/5">
                                <h4 className="text-orange-300 font-bold mb-2">EIP-1559 Style Burning</h4>
                                <p className="text-gray-400 text-sm">
                                    A portion of every transaction fee is permanently burned, reducing the total supply over time as network usage grows.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBox({ label, value, sub, color = 'cyan' }: { label: string, value: string, sub: string, color?: string }) {
    return (
        <div className="glass-panel p-6 rounded-xl border border-white/5 flex flex-col items-center text-center">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</span>
            <span className={`text-2xl font-bold text-white font-mono`}>{value}</span>
            <span className={`text-xs font-medium mt-1 ${color === 'orange' ? 'text-orange-400' : 'text-cyan-400'}`}>{sub}</span>
        </div>
    )
}

function DistributionItem({ color, percent, label }: { color: string, percent: string, label: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className={`w-3 h-12 rounded-full ${color}`}></div>
            <div>
                <div className="text-2xl font-bold text-white font-mono">{percent}</div>
                <div className="text-gray-400 text-sm">{label}</div>
            </div>
        </div>
    )
}

function UtilityItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li className="flex gap-4">
            <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-1">{title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </li>
    )
}
