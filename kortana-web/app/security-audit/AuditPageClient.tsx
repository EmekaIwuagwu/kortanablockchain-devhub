'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ShieldCheck, FileText, Download, ExternalLink, CheckCircle2,
    ChevronDown, ChevronUp, Lock, Zap, Server, Network,
    GitBranch, Star, AlertTriangle, XCircle, Shield, Eye,
    Award, BookOpen, Calendar, Hash, Code2, Layers
} from 'lucide-react';

// Served from same origin via Next.js public/ — zero CORS, native browser PDF rendering
const PDF_URL = '/kortana-security-audit-2026.pdf';
// Keep Cloudinary as a fallback download mirror
const PDF_CLOUDINARY = 'https://res.cloudinary.com/drha3dagy/raw/upload/fl_inline/v1772090185/kortana-docs/kortana-security-audit-report-2026.pdf';

// ─── Data ─────────────────────────────────────────────────────────────────────
const META = [
    { label: 'Audited System', value: 'kortana-blockchain-rust v1.1.0' },
    { label: 'Chain ID', value: '9002 — Kortana Mainnet' },
    { label: 'Native Token', value: 'DNR (Dinari)' },
    { label: 'Methodology', value: 'Static Analysis · Dynamic Fuzzing · Manual Review' },
    { label: 'Audit Date', value: 'February 26, 2026' },
    { label: 'Report Status', value: 'FINAL — POST-REMEDIATION' },
    { label: 'Audited By', value: 'Kortana Security Architecture Team' },
];

const STATS = [
    { value: '2', label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { value: '1', label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { value: '1', label: 'Medium', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { value: '5', label: 'Total Fixed', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { value: '90', label: 'Security Score', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { value: '0', label: 'Open Issues', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
];

const FINDINGS = [
    {
        id: 'K-CRIT-01',
        title: '256-bit EVM Math Precision Loss',
        severity: 'CRITICAL',
        file: 'src/vm/evm.rs',
        icon: <Zap size={18} />,
        impact: 'Economic exploit — token math produces incorrect outputs near u128 boundary',
        desc: 'The DIV, MOD, and EXP opcodes were computed using native Rust u128 types, silently truncating any operands exceeding 128 bits. Smart contracts performing token math near the u128 boundary (such as 2^128 exponentiation) would produce incorrect output values, enabling potential economic exploits against DEX pools and lending protocols.',
        fix: 'All arithmetic operations were migrated to use ethnum::u256, providing full 256-bit precision as mandated by the Ethereum Yellow Paper. The fix was verified via cross-overflow test cases covering boundary conditions.',
    },
    {
        id: 'K-CRIT-02',
        title: 'OP_CALL Missing State Reversion',
        severity: 'CRITICAL',
        file: 'src/vm/evm.rs',
        icon: <GitBranch size={18} />,
        impact: 'Atomicity violation — partial state mutations persist after failed sub-calls',
        desc: 'Failed sub-calls via the OP_CALL opcode did not revert state changes made during their execution. A contract internally calling a failing function would retain partial state mutations, violating Ethereum\'s atomicity guarantee and creating exploitable state inconsistencies that bypass intended access control logic.',
        fix: 'A snapshot-based rollback mechanism using State::snapshot and State::rollback was integrated into the OP_CALL handler. State is restored atomically on any error return from a sub-call, matching the EVM specification.',
    },
    {
        id: 'K-HIGH-01',
        title: 'RPC Memory Exhaustion / DoS',
        severity: 'HIGH',
        file: 'src/rpc/mod.rs',
        icon: <Server size={18} />,
        impact: 'Node crash — single RPC call could allocate gigabytes of RAM',
        desc: 'The eth_getRecentTransactions endpoint loaded the entire global transaction index into memory before filtering. With 40,000+ blocks of history, a single crafted RPC call could allocate gigabytes of memory and crash the node process, causing network downtime.',
        fix: 'Pagination was implemented with page and limit parameters. Filter scanning is additionally capped at MAX_FILTER_BLOCK_RANGE = 2,000 blocks per request, preventing any single request from causing unbounded resource consumption.',
    },
    {
        id: 'K-HIGH-02',
        title: 'Predictable Consensus Leader Election',
        severity: 'HIGH',
        file: 'src/consensus/mod.rs',
        icon: <Network size={18} />,
        impact: 'Targeted DoS — attacker can pre-compute and attack future block proposers',
        desc: 'Leader selection used only the current slot number as the hash seed: Keccak256(slot). An adversary who knows the slot schedule can pre-compute all future leaders and mount targeted denial-of-service attacks against the elected validator before a block is proposed.',
        fix: 'The finalised block hash is now incorporated in the seed: Keccak256(slot || prev_hash). Since prev_hash is only known after the previous block is finalised, future leaders cannot be pre-computed, eliminating the attack surface.',
    },
    {
        id: 'K-MED-01',
        title: 'Weak RPC Filter ID Entropy',
        severity: 'MEDIUM',
        file: 'src/rpc/mod.rs',
        icon: <Lock size={18} />,
        impact: 'Filter hijacking — predictable IDs susceptible to collision or brute-force',
        desc: 'RPC filter IDs were generated as SystemTime::now().as_nanos() % 0xFFFFFFFF — a 32-bit space derived from a monotonic timer. This makes IDs predictable under timing analysis and susceptible to collision or brute-force hijacking by a malicious client.',
        fix: 'Filter IDs are now generated as UUID v4 values (128-bit cryptographic randomness) using the uuid crate. The collision probability is < 1 in 10^36, rendering brute-force attacks computationally infeasible.',
    },
];

const HARDENING = [
    {
        icon: <Network size={20} />,
        title: 'P2P Connection Limiting',
        file: 'src/network/p2p.rs',
        desc: 'Added a hard cap of 50 simultaneous peers. Excess incoming connections are immediately rejected upon the ConnectionEstablished event, preventing sybil swarm attacks from exhausting file descriptor limits.',
    },
    {
        icon: <Server size={20} />,
        title: 'Safe State Recovery',
        file: 'src/main.rs',
        desc: 'Rewrote state recovery to strictly distinguish between an empty database (Genesis path) and a corrupted state (Error path). The node now halts with a diagnostic error rather than silently resetting to Genesis, preventing accidental chain wipes.',
    },
    {
        icon: <Zap size={20} />,
        title: 'Slot Continuity on Restart',
        file: 'src/main.rs',
        desc: 'Slot number is now read from the last confirmed block header on startup rather than initialised to zero. This ensures consensus slot scheduling remains consistent across node restarts, preventing leader election gaps.',
    },
    {
        icon: <Code2 size={20} />,
        title: 'Repository Hygiene',
        file: '.gitignore',
        desc: 'The local sled database directory (data/) is explicitly excluded from version control. This prevents accidental chain data overwrite when deploying code updates via git pull to production nodes.',
    },
];

const SCORECARD = [
    { label: 'EVM Arithmetic Correctness', score: 10 },
    { label: 'Transactional Atomicity', score: 10 },
    { label: 'Consensus Security', score: 9 },
    { label: 'RPC Endpoint Safety', score: 9 },
    { label: 'P2P Network Resilience', score: 8 },
    { label: 'Key Management', score: 9 },
    { label: 'Data Persistence Integrity', score: 9 },
    { label: 'Code Quality & Auditability', score: 8 },
];

const SCOPE = [
    { sys: 'EVM Execution Engine', file: 'src/vm/evm.rs', focus: 'Opcode correctness, gas metering, 256-bit arithmetic' },
    { sys: 'Block Processor', file: 'src/core/processor.rs', focus: 'Transaction validation, state transitions, fee deduction' },
    { sys: 'Consensus Layer', file: 'src/consensus/mod.rs', focus: 'Validator election, slot scheduling, finality' },
    { sys: 'JSON-RPC Interface', file: 'src/rpc/mod.rs', focus: 'Input sanitisation, pagination, filter IDs' },
    { sys: 'P2P Network Layer', file: 'src/network/p2p.rs', focus: 'Peer limits, connection management, message validation' },
    { sys: 'Storage Backend', file: 'src/storage/mod.rs', focus: 'Persistence integrity, key schema, state pointers' },
    { sys: 'Genesis Configuration', file: 'src/core/genesis.rs', focus: 'Initial supply distribution, validator bootstrapping' },
    { sys: 'Configuration Security', file: 'src/config.rs', focus: 'Environment variable handling, secret management' },
];

const SEV_CFG: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', ring: 'ring-red-500/20' },
    HIGH: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', ring: 'ring-amber-500/20' },
    MEDIUM: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', ring: 'ring-indigo-500/20' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function FindingCard({ f }: { f: typeof FINDINGS[0] }) {
    const [open, setOpen] = useState(false);
    const cfg = SEV_CFG[f.severity] ?? SEV_CFG.MEDIUM;
    return (
        <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cfg.border} ${open ? cfg.bg : 'bg-[#0b0f2a]/80'} backdrop-blur-sm`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start gap-4 p-6 text-left hover:bg-white/5 transition-colors"
                id={f.id}
            >
                {/* Severity icon */}
                <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                    {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{f.id}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                            {f.severity}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            RESOLVED ✓
                        </span>
                    </div>
                    <p className="font-bold text-white text-base mb-1">{f.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{f.file}</p>
                    {!open && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1">{f.impact}</p>
                    )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 self-start mt-1">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    {open
                        ? <ChevronUp size={16} className="text-gray-500" />
                        : <ChevronDown size={16} className="text-gray-500" />}
                </div>
            </button>

            {open && (
                <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
                    <div className={`rounded-xl p-4 ${cfg.bg} border ${cfg.border}`}>
                        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${cfg.text}`}>Impact</p>
                        <p className="text-sm text-white font-medium">{f.impact}</p>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Finding Detail</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{f.desc}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Remediation Applied</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{f.fix}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const pct = (score / 10) * 100;
    const color = score >= 9 ? '#10b981' : score >= 7 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-4 group">
            <p className="text-sm text-gray-400 group-hover:text-white transition-colors w-56 flex-shrink-0">{label}</p>
            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-sm font-black text-white w-12 text-right tabular-nums">{score}/10</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditPageClient() {
    const [pdfOpen, setPdfOpen] = useState(true); // open by default for investors

    return (
        <div className="min-h-screen bg-deep-space text-white relative overflow-hidden">
            {/* Ambient glows */}
            <div className="fixed top-0 left-0 w-[700px] h-[700px] bg-emerald-500/4 blur-[200px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/4 blur-[180px] rounded-full pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-500/2 blur-[250px] rounded-full pointer-events-none" />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative pt-28 pb-20 px-4 border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/8 to-transparent pointer-events-none" />
                {/* Top grid lines decoration */}
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                <div className="relative max-w-5xl mx-auto">
                    {/* Top badge row */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-400">
                            <ShieldCheck size={12} /> Certified Secure
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-400">
                            <Eye size={12} /> Confidential — Investors Only
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gray-400">
                            <Calendar size={12} /> February 26, 2026
                        </span>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-5 leading-tight">
                            <span className="text-white">Internal Security</span>
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Audit Report
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            A comprehensive independent security assessment of the{' '}
                            <span className="text-white font-semibold">Kortana Mainnet v1.1.0</span>{' '}
                            — covering the EVM engine, consensus layer, RPC interface, and P2P networking.
                            {' '}<span className="text-emerald-400 font-bold">All 5 findings remediated.</span>
                        </p>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        <button
                            onClick={() => setPdfOpen(!pdfOpen)}
                            className="group flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-100 transition-all shadow-[0_0_40px_-8px_rgba(6,182,212,0.7)]"
                        >
                            <BookOpen size={16} />
                            {pdfOpen ? 'Close PDF Viewer' : 'View Audit Report PDF'}
                        </button>
                        <a
                            href={PDF_URL}
                            download="Kortana-Security-Audit-2026.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 border border-white/20 bg-white/5 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 hover:scale-105 active:scale-100 transition-all"
                        >
                            <Download size={16} />
                            Download PDF
                        </a>
                    </div>

                    {/* PDF Viewer */}
                    {pdfOpen && (
                        <div className="mb-12 rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_80px_-20px_rgba(6,182,212,0.4)] transition-all">
                            <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1235] border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    <span className="ml-3 text-xs text-gray-400 font-mono">KORTANA_SECURITY_AUDIT_REPORT.pdf</span>
                                </div>
                                <a href={PDF_URL} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-cyan-400 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <ExternalLink size={11} /> Open in New Tab
                                </a>
                            </div>
                            {/* Native browser PDF renderer — object tag uses Chromium built-in PDF engine, zero CORS issues */}
                            <object
                                data={PDF_URL}
                                type="application/pdf"
                                className="w-full bg-[#0a0e27]"
                                style={{ height: '82vh', minHeight: '700px', border: 'none' }}
                            >
                                {/* Fallback for browsers that don't support object PDF */}
                                <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                                    <FileText size={48} className="text-gray-600" />
                                    <p className="text-gray-400">Your browser blocked the inline preview.</p>
                                    <a href={PDF_URL} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-cyan-500/20 transition-colors">
                                        <ExternalLink size={14} /> Open PDF in New Tab
                                    </a>
                                </div>
                            </object>
                        </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {STATS.map(s => (
                            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5 text-center transition-all hover:scale-105`}>
                                <p className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}{s.label === 'Security Score' ? '/100' : ''}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AUDIT STATUS BANNER ──────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 py-12">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/25 via-emerald-900/10 to-transparent" />
                    <div className="absolute inset-0 border border-emerald-500/25 rounded-3xl" />
                    {/* Glow top-right */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[80px] rounded-full" />
                    <div className="relative flex flex-wrap items-center gap-6 p-8 md:p-10">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]">
                            <Award size={28} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Final Audit Verdict</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">PASSED — System Certified Secure</h2>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                The Kortana Mainnet v1.1.0 has undergone a comprehensive internal security audit.
                                All 5 identified vulnerabilities have been remediated and independently verified.
                                The system meets institutional-grade security standards for public deployment.
                            </p>
                        </div>
                        <div className="flex-shrink-0 text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-5xl font-black text-emerald-400">90</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Score / 100</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── AUDIT META ───────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-12">
                <div className="grid md:grid-cols-2 gap-3">
                    {META.map(m => (
                        <div key={m.label} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 hover:bg-white/[0.04] transition-colors">
                            <Hash size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">{m.label}</p>
                                <p className="text-sm text-white font-medium mt-0.5">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SCOPE ────────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-8">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest font-black mb-2">What Was Reviewed</p>
                    <h2 className="text-3xl font-black text-white">Scope of Audit</h2>
                </div>
                <div className="rounded-2xl border border-white/8 overflow-hidden">
                    {SCOPE.map((s, i) => (
                        <div key={s.sys} className={`flex flex-wrap items-center gap-4 px-5 py-4 ${i !== SCOPE.length - 1 ? 'border-b border-white/5' : ''} ${i % 2 === 0 ? 'bg-white/[0.015]' : ''} hover:bg-white/[0.04] transition-colors`}>
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                            <p className="font-bold text-white text-sm w-44 flex-shrink-0">{s.sys}</p>
                            <p className="font-mono text-xs text-cyan-400 w-44 flex-shrink-0">{s.file}</p>
                            <p className="text-xs text-gray-500 flex-1">{s.focus}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FINDINGS ─────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-8">
                    <p className="text-xs text-red-400 uppercase tracking-widest font-black mb-2">Security Findings</p>
                    <h2 className="text-3xl font-black text-white">Detailed Findings & Remediations</h2>
                    <p className="text-gray-500 text-sm mt-2">Click any finding to expand full technical detail and remediation evidence.</p>
                </div>
                <div className="space-y-3">
                    {FINDINGS.map(f => <FindingCard key={f.id} f={f} />)}
                </div>
            </section>

            {/* ── ADDITIONAL HARDENING ─────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="mb-8">
                    <p className="text-xs text-purple-400 uppercase tracking-widest font-black mb-2">Proactive Defence</p>
                    <h2 className="text-3xl font-black text-white">Additional Security Hardening</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {HARDENING.map(h => (
                        <div key={h.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-purple-500/20 transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                    {h.icon}
                                </div>
                                <div>
                                    <p className="font-bold text-white mb-0.5">{h.title}</p>
                                    <p className="text-xs text-cyan-400 font-mono mb-3">{h.file}</p>
                                    <p className="text-sm text-gray-400 leading-relaxed">{h.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SCORECARD ────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-10">
                    <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                        <div>
                            <p className="text-xs text-cyan-400 uppercase tracking-widest font-black mb-2">Evaluation Results</p>
                            <h2 className="text-2xl font-black text-white">Security Scorecard</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                            ))}
                            <span className="text-sm text-white font-black ml-2">Excellent Rating</span>
                        </div>
                    </div>
                    <div className="space-y-5 mb-8">
                        {SCORECARD.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}
                    </div>
                    <div className="pt-6 border-t border-white/8 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            Audited by the <span className="text-white font-bold">Kortana Security Architecture Team</span>
                        </p>
                        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-5 py-2.5 flex items-center gap-3">
                            <p className="text-3xl font-black text-cyan-400">90<span className="text-base">/100</span></p>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Overall</p>
                                <p className="text-xs font-black text-cyan-400">EXCELLENT</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CERTIFICATION ────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 pb-16">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/15 to-deep-space" />
                    <div className="absolute inset-0 border border-white/8 rounded-3xl" />
                    <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/5 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full" />
                    <div className="relative p-10 md:p-14 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_-10px_rgba(6,182,212,0.8)]">
                            <Shield size={36} className="text-white" />
                        </div>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2 mb-6">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Audit Passed — All Findings Resolved</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Download the Full Report</h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                            The complete 5-page internal security audit report includes detailed technical findings,
                            remediation evidence, a full security scorecard, and signed certification from the
                            Kortana Security Architecture Team.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={PDF_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-100 transition-all shadow-[0_0_40px_-8px_rgba(6,182,212,0.5)]"
                            >
                                <ExternalLink size={16} />
                                Open PDF Report
                                <ExternalLink size={13} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href={PDF_URL}
                                download="Kortana-Security-Audit-2026.pdf"
                                className="flex items-center gap-2.5 border border-white/20 bg-white/5 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 hover:scale-105 active:scale-100 transition-all"
                            >
                                <Download size={16} />
                                Download PDF
                            </a>
                        </div>
                        <p className="text-gray-700 text-xs mt-8">
                            Kortana Foundation · Internal Security Audit · February 2026 · Hosted on Cloudinary
                        </p>
                    </div>
                </div>
            </section>

            {/* bottom padding */}
            <div className="h-16" />
        </div>
    );
}
