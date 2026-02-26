'use client';

import { useState } from 'react';
import {
    ShieldCheck, FileText, Download, ExternalLink, CheckCircle2,
    AlertTriangle, XCircle, ChevronDown, ChevronUp, Lock, Zap,
    Server, Network, GitBranch, Star
} from 'lucide-react';

// Uploaded as resource_type=image with fl_inline flag — allows browser-native PDF viewing
const AUDIT_PDF_URL =
    'https://res.cloudinary.com/drha3dagy/image/upload/fl_inline/v1772090481/kortana-docs/kortana-security-audit-report-2026.pdf';

// ─── Data ─────────────────────────────────────────────────────────────────────
const findings = [
    {
        id: 'K-CRIT-01',
        title: '256-bit EVM Math Precision',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        file: 'src/vm/evm.rs',
        icon: <Zap size={16} />,
        desc: 'DIV, MOD, and EXP opcodes were computed using native u128 types, silently truncating operands exceeding 128 bits. Remediated by migrating all arithmetic to ethnum::u256 for full Yellow Paper compliance.',
    },
    {
        id: 'K-CRIT-02',
        title: 'OP_CALL State Reversion',
        severity: 'CRITICAL',
        status: 'RESOLVED',
        file: 'src/vm/evm.rs',
        icon: <GitBranch size={16} />,
        desc: 'Failed sub-calls did not revert their state changes, violating Ethereum\'s atomicity guarantee. Remediated by integrating snapshot-based rollback (State::snapshot / State::rollback) into the OP_CALL handler.',
    },
    {
        id: 'K-HIGH-01',
        title: 'RPC Memory Exhaustion DoS',
        severity: 'HIGH',
        status: 'RESOLVED',
        file: 'src/rpc/mod.rs',
        icon: <Server size={16} />,
        desc: 'The eth_getRecentTransactions endpoint loaded the entire transaction index into memory before filtering. Remediated via pagination and a MAX_FILTER_BLOCK_RANGE cap of 2,000 blocks.',
    },
    {
        id: 'K-HIGH-02',
        title: 'Predictable Leader Election',
        severity: 'HIGH',
        status: 'RESOLVED',
        file: 'src/consensus/mod.rs',
        icon: <Network size={16} />,
        desc: 'Leader selection used only the slot number as seed, allowing pre-computation of future leaders. Remediated by incorporating the finalised block hash: Keccak256(slot || prev_hash).',
    },
    {
        id: 'K-MED-01',
        title: 'Weak RPC Filter ID Entropy',
        severity: 'MEDIUM',
        status: 'RESOLVED',
        file: 'src/rpc/mod.rs',
        icon: <Lock size={16} />,
        desc: 'Filter IDs were 32-bit timestamps, predictable under timing analysis. Remediated by using UUID v4 (128-bit cryptographic randomness) from the uuid crate.',
    },
];

const scorecard = [
    { label: 'EVM Arithmetic Correctness', score: 10 },
    { label: 'Transactional Atomicity', score: 10 },
    { label: 'Consensus Security', score: 9 },
    { label: 'RPC Endpoint Safety', score: 9 },
    { label: 'P2P Network Resilience', score: 8 },
    { label: 'Key Management', score: 9 },
    { label: 'Data Persistence Integrity', score: 9 },
    { label: 'Code Quality & Auditability', score: 8 },
];

const stats = [
    { value: '5', label: 'Vulnerabilities Found', color: 'text-amber-400' },
    { value: '5', label: 'Vulnerabilities Fixed', color: 'text-emerald-400' },
    { value: '0', label: 'Open Issues', color: 'text-cyan-400' },
    { value: '90%', label: 'Security Score', color: 'text-purple-400' },
];

const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40' },
    HIGH: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' },
    MEDIUM: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/40' },
    LOW: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40' },
};

// ─── Components ───────────────────────────────────────────────────────────────
function FindingCard({ f }: { f: typeof findings[0] }) {
    const [open, setOpen] = useState(false);
    const cfg = severityConfig[f.severity] ?? severityConfig.LOW;
    return (
        <div
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${cfg.border} bg-[#0d1130]/60 backdrop-blur-sm`}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
            >
                <span className={`flex-shrink-0 p-2 rounded-lg ${cfg.bg} ${cfg.text}`}>{f.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-cyan-400">{f.id}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                            {f.severity}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                            {f.status}
                        </span>
                    </div>
                    <p className="font-semibold text-white text-sm truncate">{f.title}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{f.file}</p>
                </div>
                <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-400" />
                {open ? <ChevronUp size={16} className="flex-shrink-0 text-gray-400" /> : <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />}
            </button>
            {open && (
                <div className="px-5 pb-5 pt-1 border-t border-white/5 text-sm text-gray-300 leading-relaxed">
                    {f.desc}
                </div>
            )}
        </div>
    );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const pct = (score / 10) * 100;
    const color = score >= 9 ? '#10b981' : score >= 7 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-4">
            <p className="text-sm text-gray-300 w-52 flex-shrink-0">{label}</p>
            <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-sm font-bold text-white w-10 text-right">{score}/10</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditPageClient() {
    return (
        <div className="min-h-screen bg-deep-space text-white pb-32 relative overflow-hidden">
            {/* BG glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[140px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/3 blur-[200px] rounded-full pointer-events-none" />

            {/* Hero ─────────────────────────────────────────────────────────────── */}
            <section className="relative py-28 px-4 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-transparent" />
                <div className="relative max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-8">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Certified Secure · February 2026</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                        <span className="text-white">Security</span>
                        <br />
                        <span className="text-gradient">Audit Report</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        An independent, comprehensive internal security audit of the Kortana Mainnet v1.1.0 codebase —
                        covering the EVM execution engine, consensus layer, RPC interface, and P2P networking stack.
                        <strong className="text-emerald-400"> All findings have been remediated.</strong>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href={AUDIT_PDF_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_-8px_rgba(6,182,212,0.6)]"
                        >
                            <FileText size={16} />
                            View Full Audit PDF
                            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href={AUDIT_PDF_URL}
                            download="Kortana-Security-Audit-2026.pdf"
                            className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 transition-all"
                        >
                            <Download size={16} />
                            Download PDF
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats ─────────────────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="glass-panel rounded-2xl p-6 text-center">
                            <p className={`text-4xl font-black mb-2 ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Audit status banner ────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-12">
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 p-1">
                    <div className="rounded-xl bg-[#0d1130]/80 p-6 flex flex-wrap items-center gap-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 flex-shrink-0">
                            <ShieldCheck size={28} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-1">Audit Status</p>
                            <h2 className="text-white text-xl font-black">PASSED — System Certified Secure</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                The Kortana Mainnet v1.1.0 has been assessed and all identified vulnerabilities remediated.
                                The system meets institutional-grade security standards.
                            </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-4xl font-black text-emerald-400">90<span className="text-xl">/100</span></p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Overall Score</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Embedded PDF Preview ───────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-6">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest font-black mb-2">Live Document Preview</p>
                    <h2 className="text-3xl font-black text-white">Read In-Browser</h2>
                    <p className="text-gray-400 mt-2 text-sm">The full audit report is embedded below for immediate review — no download required.</p>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1130]/60 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)]">
                    {/* Toolbar bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-midnight-blue/80">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                            <span className="ml-3 text-xs text-gray-400 font-mono">KORTANA_SECURITY_AUDIT_REPORT.pdf</span>
                        </div>
                        <a
                            href={AUDIT_PDF_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                            <ExternalLink size={12} /> Open Full Screen
                        </a>
                    </div>
                    <iframe
                        src={AUDIT_PDF_URL}
                        title="Kortana Security Audit Report 2026"
                        className="w-full"
                        style={{ height: '75vh', minHeight: '600px', border: 'none', background: '#0a0e27' }}
                        loading="lazy"
                    />
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-8">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest font-black mb-2">Detailed Analysis</p>
                    <h2 className="text-3xl font-black text-white">Findings &amp; Remediations</h2>
                    <p className="text-gray-400 mt-2 text-sm">Click any finding to expand the full technical description and remediation steps.</p>
                </div>
                <div className="space-y-3">
                    {findings.map((f) => (
                        <FindingCard key={f.id} f={f} />
                    ))}
                </div>
            </section>

            {/* Scorecard ──────────────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="glass-panel rounded-2xl p-8">
                    <div className="mb-6">
                        <p className="text-xs text-cyan-400 uppercase tracking-widest font-black mb-2">Security Scorecard</p>
                        <h2 className="text-2xl font-black text-white">Category Breakdown</h2>
                    </div>
                    <div className="space-y-4">
                        {scorecard.map((item) => (
                            <ScoreBar key={item.label} label={item.label} score={item.score} />
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">
                            Audited by the <strong className="text-white">Kortana Security Architecture Team</strong>
                        </p>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                            ))}
                            <span className="text-sm text-white font-bold ml-2">Excellent</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Hardening ────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-8">
                    <p className="text-xs text-purple-400 uppercase tracking-widest font-black mb-2">Beyond the Scope</p>
                    <h2 className="text-3xl font-black text-white">Additional Hardening</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {[
                        { icon: <Network size={20} />, title: 'P2P Connection Limits', desc: 'Max 50 simultaneous peers enforced to prevent sybil swarm attacks and file descriptor exhaustion.' },
                        { icon: <Server size={20} />, title: 'Safe State Recovery', desc: 'Node now halts with a diagnostic error if DB traces are found without a matching state snapshot — no silent genesis reset.' },
                        { icon: <Zap size={20} />, title: 'Slot Continuity', desc: 'Slot numbers now resume from the last confirmed block after node restart, preventing consensus gaps.' },
                        { icon: <Lock size={20} />, title: 'Repository Hygiene', desc: 'The production database directory is now excluded from version control, preventing accidental chain wipes via git pull.' },
                    ].map((item) => (
                        <div key={item.title} className="glass-panel rounded-xl p-5 flex gap-4">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-purple-500/15 text-purple-400 h-fit">{item.icon}</div>
                            <div>
                                <p className="font-bold text-white text-sm mb-1">{item.title}</p>
                                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF Download CTA ───────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-4">
                <div className="relative rounded-3xl overflow-hidden">
                    {/* BG gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-purple-900/20 to-deep-space" />
                    <div className="absolute inset-0 border border-white/10 rounded-3xl" />
                    <div className="relative p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_-8px_rgba(6,182,212,0.8)]">
                            <FileText size={28} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-3">Download the Full Report</h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
                            The complete 5-page internal security audit report includes detailed technical findings,
                            remediation evidence, a full scorecard, and signed certification from the Kortana
                            Security Architecture Team.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={AUDIT_PDF_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_-8px_rgba(6,182,212,0.5)]"
                            >
                                <ExternalLink size={16} />
                                Open PDF Report
                            </a>
                            <a
                                href={AUDIT_PDF_URL}
                                download="Kortana-Security-Audit-2026.pdf"
                                className="flex items-center gap-2 border border-white/20 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 transition-all"
                            >
                                <Download size={16} />
                                Download PDF
                            </a>
                        </div>
                        <p className="text-gray-600 text-xs mt-6">
                            Kortana Foundation · Internal Audit Report · v1.1.0 · February 2026 · Hosted on Cloudinary
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
