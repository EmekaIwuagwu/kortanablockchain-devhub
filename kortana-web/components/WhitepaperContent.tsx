'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Book, Zap, Cpu, Globe, Layers, Clock, CircleDollarSign, Server,
    Download, ChevronRight, FileText, CheckCircle, Shield,
    Users, Hash, Database, AlertTriangle
} from 'lucide-react';

const sectionIds = ['abstract', 'architecture', 'consensus', 'validators', 'execution', 'tokenomics', 'addresses', 'state', 'network'];

export default function WhitepaperContent() {
    const [activeSection, setActiveSection] = useState('abstract');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of sectionIds) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-400 mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16 relative z-10">
            <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-32 space-y-8">
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-white/2">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 px-2">Table of Contents</h3>
                        <nav className="space-y-1">
                            <NavItem id="abstract" label="Abstract" icon={<FileText size={14} />} active={activeSection === 'abstract'} onClick={() => scrollToSection('abstract')} />
                            <NavItem id="architecture" label="System Architecture" icon={<Layers size={14} />} active={activeSection === 'architecture'} onClick={() => scrollToSection('architecture')} />
                            <NavItem id="consensus" label="DPoH Consensus" icon={<Clock size={14} />} active={activeSection === 'consensus'} onClick={() => scrollToSection('consensus')} />
                            <NavItem id="validators" label="Validators & Security" icon={<Shield size={14} />} active={activeSection === 'validators'} onClick={() => scrollToSection('validators')} />
                            <NavItem id="execution" label="Dual VM Execution" icon={<Cpu size={14} />} active={activeSection === 'execution'} onClick={() => scrollToSection('execution')} />
                            <NavItem id="tokenomics" label="Token Economics" icon={<CircleDollarSign size={14} />} active={activeSection === 'tokenomics'} onClick={() => scrollToSection('tokenomics')} />
                            <NavItem id="addresses" label="Address Format" icon={<Hash size={14} />} active={activeSection === 'addresses'} onClick={() => scrollToSection('addresses')} />
                            <NavItem id="state" label="State Management" icon={<Database size={14} />} active={activeSection === 'state'} onClick={() => scrollToSection('state')} />
                            <NavItem id="network" label="Network & Storage" icon={<Server size={14} />} active={activeSection === 'network'} onClick={() => scrollToSection('network')} />
                        </nav>
                    </div>
                    <a href="/kortana_whitepaper.pdf"
                        download="kortana_whitepaper.pdf"
                        className="w-full py-4 bg-white text-deep-space font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl shadow-white/5 group"
                    >
                        <Download size={14} /> Download PDF
                    </a>
                    <div className="text-center">
                        <p className="text-[10px] text-gray-600 font-mono">Version 2.0.0 • Production Ready</p>
                    </div>
                </div>
            </div>

            <div ref={contentRef} data-print-content className="flex-1 space-y-24">

                {/* ═══════════════════════════ ABSTRACT ═══════════════════════════ */}
                <Section id="abstract" title="Abstract" icon={<Book className="text-cyan-400" />}>
                    <p className="text-xl text-gray-300 font-medium leading-relaxed">
                        Kortana is a production-grade Layer 1 blockchain engineered from the ground up for industrial-scale
                        decentralized applications and global credit markets. Written entirely in <strong>Rust</strong>, Kortana
                        introduces a novel <strong>Delegated Proof-of-History (DPoH)</strong> consensus mechanism that fuses
                        cryptographic time-ordering with Byzantine fault-tolerant finality, achieving <strong>2-second block
                            times</strong> with <strong>sub-2-second irreversible finality</strong>.
                    </p>
                    <p className="text-gray-400 mt-6 leading-relaxed">
                        Unlike conventional Layer 1 chains that force developers to choose between EVM compatibility and raw performance,
                        Kortana provides a <strong>Dual Virtual Machine</strong> architecture: a full EVM execution engine for Solidity
                        contracts alongside <strong>Quorlin</strong>, a custom stack-based VM optimized for high-throughput workloads.
                        Both VMs share a unified state layer built on Merkle-Patricia Tries with SHA3-256 root hashing, ensuring
                        cryptographic verifiability across execution environments.
                    </p>
                    <p className="text-gray-400 mt-4 leading-relaxed">
                        The network is secured by 50 active validators operating under a delegated staking model with
                        comprehensive slashing conditions — from 1% penalties for downtime to 100% stake burns for proven Byzantine
                        behavior. The native <strong>DINAR (DNR)</strong> token has a fixed total supply of <strong>500 Billion DNR</strong>,
                        with <strong>10 Billion DNR</strong> in genesis circulation and the remaining 490 Billion held across two
                        on-chain treasury accounts with governance-controlled release schedules.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
                        <StatCard value="2s" label="Block Time" />
                        <StatCard value="< 2s" label="Finality" />
                        <StatCard value="50" label="Validators" />
                        <StatCard value="500B" label="Total Supply" />
                    </div>
                </Section>

                {/* ═══════════════════════════ ARCHITECTURE ═══════════════════════════ */}
                <Section id="architecture" title="1. System Architecture" icon={<Layers className="text-purple-400" />}>
                    <p className="mb-4">
                        Kortana&apos;s architecture is organized into five distinct, independently verifiable layers. Each layer is
                        purpose-built and can be upgraded without affecting the others — a critical design choice for
                        long-term maintainability of a production blockchain.
                    </p>
                    <div className="space-y-4 mt-8">
                        <ArchitectureItem
                            layer="Application"
                            desc="JSON-RPC 2.0 compliant API supporting eth_chainId, eth_blockNumber, eth_gasPrice, net_version, and web3_clientVersion. Full compatibility with MetaMask, Remix, Hardhat, and all standard EVM tooling. WebSocket subscriptions for real-time block and transaction events."
                        />
                        <ArchitectureItem
                            layer="Consensus"
                            desc="Delegated Proof-of-History provides a cryptographic clock via recursive SHA3-256 hashing, eliminating the need for inter-node time agreement. A Tower BFT finality layer runs atop the PoH sequence, achieving irreversible finality in under 2 seconds with 2/3 + 1 super-majority voting."
                        />
                        <ArchitectureItem
                            layer="Execution"
                            desc="Dual VM engine: EVM with 50+ standard opcodes (arithmetic, stack, memory, control flow) and Quorlin with 25+ custom instructions (including local/global storage, event emission, and assertion primitives). Each transaction specifies its target VM, and both share a unified state trie."
                        />
                        <ArchitectureItem
                            layer="State"
                            desc="Merkle-Patricia Trie with SHA3-256 root hashing. Each account stores nonce, balance, code hash, contract storage, and a contract flag. State snapshots enable fast node syncing without replaying the full chain history, while pruning keeps disk usage bounded."
                        />
                        <ArchitectureItem
                            layer="Persistence"
                            desc="RocksDB tuned for high-throughput write amplification. Four storage domains: block store (indexed by height, hash, and slot), state snapshots (account history), receipt store (transaction execution results), and index DB (address → transaction history mapping)."
                        />
                    </div>

                    <h4 className="text-white font-bold mt-12 mb-4">Design Principles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PrincipleCard icon={<Zap size={16} />} title="Speed" desc="2-second blocks and sub-2-second finality through deterministic leader scheduling on the PoH clock." />
                        <PrincipleCard icon={<Shield size={16} />} title="Security" desc="Military-grade cryptography: SHA3-256, ECDSA signatures, BLS12-381 aggregation, and checksum-verified addresses." />
                        <PrincipleCard icon={<Cpu size={16} />} title="Flexibility" desc="Dual VM architecture lets developers choose between EVM compatibility and Quorlin's raw performance." />
                        <PrincipleCard icon={<Users size={16} />} title="Decentralization" desc="50 active validators with delegated staking, commission-based rewards, and democratic governance readiness." />
                    </div>
                </Section>

                {/* ═══════════════════════════ CONSENSUS ═══════════════════════════ */}
                <Section id="consensus" title="2. Delegated Proof-of-History" icon={<Clock className="text-neon-green" />}>
                    <div className="prose prose-invert max-w-none text-gray-400 font-medium">
                        <p>
                            The fundamental bottleneck in distributed systems is <strong>time agreement</strong>. Traditional blockchains
                            like Bitcoin use Proof-of-Work as an implicit clock, while Ethereum&apos;s Proof-of-Stake relies on synchronized
                            slot timers. Both approaches introduce latency because nodes must communicate to establish ordering.
                        </p>
                        <p className="mt-4">
                            Kortana eliminates this bottleneck with <strong>Proof-of-History (PoH)</strong> — a cryptographically
                            verifiable passage-of-time mechanism. A designated leader continuously computes a recursive SHA3-256
                            hash chain, where each output becomes the input for the next hash. This creates an immutable,
                            sequentially ordered record that proves time has elapsed between events without requiring any
                            inter-node communication.
                        </p>

                        <h4 className="text-white font-bold mt-10 mb-6">The PoH Hash Chain</h4>
                        <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5 font-mono text-xs text-cyan-400 overflow-x-auto">
                            <p className="text-gray-500 mb-2">{'// Recursive SHA3-256 hash chain — each hash proves elapsed time'}</p>
                            <p>hash[0] = SHA3-256(genesis_seed)</p>
                            <p>hash[1] = SHA3-256(hash[0])</p>
                            <p>hash[2] = SHA3-256(hash[1] || transaction_data)</p>
                            <p>hash[n] = SHA3-256(hash[n-1] || optional_data)</p>
                            <p className="text-gray-500 mt-2">{'// Verification: replay N hashes to confirm sequence integrity'}</p>
                        </div>
                        <p className="mt-6">
                            Transactions are woven into the hash chain by concatenating their data with the current hash before computing the
                            next iteration. This creates an unforgeable timestamp that proves a transaction existed at a specific
                            point in the sequence. Validators can independently verify sequence integrity by replaying the hash chain.
                        </p>

                        <h4 className="text-white font-bold mt-10 mb-6">Slot-Based Block Production</h4>
                        <ul className="list-none space-y-4 pl-0">
                            <BulletItem text="Each slot is exactly 2 seconds. The network produces one block per slot, yielding 43,200 blocks per day and approximately 15,768,000 blocks per year." />
                            <BulletItem text="An epoch consists of 432 slots (~14.4 minutes). Validator sets and leader schedules are recomputed at epoch boundaries based on current stake distributions." />
                            <BulletItem text="Leader election is deterministic and stake-weighted: validators with more delegated stake are selected more frequently, but every active validator gets proportional representation." />
                            <BulletItem text="If a leader misses their slot (due to downtime or network partition), the slot is skipped and the next leader in the schedule produces the following block. Missed slots count toward downtime slashing thresholds." />
                        </ul>

                        <h4 className="text-white font-bold mt-10 mb-6">Byzantine Finality Layer (Tower BFT)</h4>
                        <p>
                            On top of the PoH clock, Kortana runs a PBFT-inspired finality protocol. After a block is proposed, validators
                            cast <strong>FinalizationVotes</strong> that reference the PoH hash sequence number. When a block accumulates
                            votes from validators controlling more than <strong>2/3 + 1</strong> of the total active stake, it becomes
                            <strong> irreversibly finalized</strong>. The finality delay is set to 20 slots, meaning blocks achieve
                            absolute finality within approximately 1.5 to 2 seconds under normal network conditions.
                        </p>
                        <p className="mt-4">
                            The system includes <strong>equivocation detection</strong>: if a validator signs two conflicting votes
                            for the same slot, the conflicting signatures serve as cryptographic proof of misbehavior, triggering
                            automatic slashing of 33% of the validator&apos;s stake. Vote records are pruned after finalization to
                            maintain constant memory usage.
                        </p>
                    </div>
                </Section>

                {/* ═══════════════════════════ VALIDATORS ═══════════════════════════ */}
                <Section id="validators" title="3. Validators & Security" icon={<Shield className="text-red-400" />}>
                    <p className="mb-6">
                        Kortana&apos;s security model is anchored by an economic incentive system that makes honest behavior
                        profitable and Byzantine behavior catastrophically expensive. The validator set is capped at <strong>50
                            active validators</strong>, selected by total stake (self-bonded plus delegated).
                    </p>

                    <h4 className="text-white font-bold mt-8 mb-4">Validator Lifecycle</h4>
                    <div className="space-y-4">
                        <BulletItem text="Registration: Validators must bond a minimum of 32 DNR and set a commission rate (0-100%, in basis points). The commission determines the validator's cut of delegator rewards." />
                        <BulletItem text="Delegation: Token holders can delegate their DNR to any registered validator, increasing that validator's total stake and probability of leader selection. Delegators earn proportional rewards minus the validator's commission." />
                        <BulletItem text="Active Set: At each epoch boundary, the top 50 validators by total stake are selected as the active set. Only active validators participate in block production and finality voting." />
                        <BulletItem text="Exit: Validators can voluntarily exit by unbonding their stake, subject to an unbonding period. Delegators can undelegate at any time with the same cooldown." />
                    </div>

                    <h4 className="text-white font-bold mt-10 mb-6">Slashing Conditions</h4>
                    <p className="mb-6">
                        Misbehavior is punished through automatic stake slashing. Slashing records are permanently stored on-chain,
                        and repeated offenses compound the penalties. The four slashing conditions are:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SlashCard severity="LOW" title="Downtime" penalty="1%" desc="Triggered after 50 consecutive missed blocks. The validator is automatically jailed for ~25 days (432,000 slots) and must manually unjail after the cooldown." color="text-yellow-400" />
                        <SlashCard severity="MEDIUM" title="Double Proposal" penalty="10%" desc="Proposing two different blocks for the same slot. Detected by comparing block headers signed by the same validator key for identical slot numbers." color="text-orange-400" />
                        <SlashCard severity="HIGH" title="Equivocation" penalty="33%" desc="Casting conflicting finality votes for the same slot. Proven by presenting two valid signatures from the same validator on contradictory FinalizationVote messages." color="text-red-400" />
                        <SlashCard severity="CRITICAL" title="Byzantine" penalty="100%" desc="Coordinated attacks such as censorship or state corruption. Results in full stake burn and permanent removal from the validator set. No unjailing possible." color="text-red-600" />
                    </div>

                    <h4 className="text-white font-bold mt-10 mb-4">Cryptographic Security</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <NetworkSpec label="Hashing" value="SHA3-256" />
                        <NetworkSpec label="Signatures" value="ECDSA (secp256k1)" />
                        <NetworkSpec label="Aggregation" value="BLS12-381" />
                    </div>
                </Section>

                {/* ═══════════════════════════ EXECUTION ═══════════════════════════ */}
                <Section id="execution" title="4. Dual VM Execution Engine" icon={<Cpu className="text-blue-400" />}>
                    <p className="mb-8">
                        Kortana solves the fundamental tradeoff between ecosystem compatibility and raw performance by implementing
                        two virtual machines that share a unified state layer. Each transaction specifies its target VM type,
                        and both VMs are gas-metered to prevent denial-of-service attacks.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 rounded-2xl bg-white/2 border-white/5">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Globe size={18} className="text-purple-400" /> EVM Execution Engine
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                A complete Ethereum Virtual Machine implementation supporting 50+ opcodes. Developers can deploy
                                existing Solidity and Vyper contracts without modification. The EVM engine provides a full
                                stack machine with 1024-depth stack, word-addressable memory, and persistent key-value storage.
                            </p>
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Implemented Opcodes</h5>
                            <div className="text-xs text-gray-500 space-y-1 mb-4">
                                <p><span className="text-cyan-400 font-mono">Arithmetic:</span> ADD, SUB, MUL, DIV, MOD, EXP</p>
                                <p><span className="text-cyan-400 font-mono">Stack:</span> PUSH1-PUSH32, DUP1-DUP16, SWAP1-SWAP16, POP</p>
                                <p><span className="text-cyan-400 font-mono">Memory:</span> MSTORE, MLOAD, MSTORE8</p>
                                <p><span className="text-cyan-400 font-mono">Control:</span> JUMP, JUMPI, REVERT, RETURN, STOP</p>
                                <p><span className="text-cyan-400 font-mono">System:</span> CALL, CREATE, SELFDESTRUCT, LOG0-LOG4</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Tag>Solidity</Tag><Tag>Vyper</Tag><Tag>Hardhat</Tag><Tag>Remix</Tag>
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-2xl bg-white/2 border-white/5">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-neon-green" /> Quorlin Virtual Machine
                            </h4>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                A custom stack-based VM purpose-built for high-throughput workloads. Quorlin provides 256 local
                                variable slots, global key-value storage, and native event emission — all with lower gas
                                costs than equivalent EVM operations, making it ideal for data-intensive applications.
                            </p>
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Instruction Set</h5>
                            <div className="text-xs text-gray-500 space-y-1 mb-4">
                                <p><span className="text-neon-green font-mono">Arithmetic:</span> Add, Sub, Mul, Div, Mod</p>
                                <p><span className="text-neon-green font-mono">Bitwise:</span> And, Or, Xor, Not</p>
                                <p><span className="text-neon-green font-mono">Comparison:</span> Eq, Lt, Gt</p>
                                <p><span className="text-neon-green font-mono">Storage:</span> Load, Store, LoadGlobal, StoreGlobal</p>
                                <p><span className="text-neon-green font-mono">Control:</span> Return, Emit, Revert, Assert, Dup</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Tag>Rust SDK</Tag><Tag>25+ Opcodes</Tag><Tag>Low Gas</Tag><Tag>Event Emission</Tag>
                            </div>
                        </div>
                    </div>

                    <h4 className="text-white font-bold mt-10 mb-4">Gas Metering</h4>
                    <p className="text-sm text-gray-400">
                        Both VMs use gas metering to bound computation. Each opcode has a defined gas cost, and transactions
                        must specify a gas limit (minimum 21,000; maximum 10,000,000 per transaction). The block gas limit is
                        capped at 30,000,000 to ensure block propagation stays within the 2-second slot window. Gas prices
                        use a dynamic base fee adjusted per 2-block window, with a floor of 1 satoshi (10⁻¹⁸ DNR).
                    </p>
                </Section>

                {/* ═══════════════════════════ TOKENOMICS ═══════════════════════════ */}
                <Section id="tokenomics" title="5. Token Economics" icon={<CircleDollarSign className="text-yellow-400" />}>
                    <div className="mb-10">
                        <p className="text-lg">
                            The <strong>DINAR (DNR)</strong> is the native utility token of the Kortana network, serving as the
                            unit of account for gas fees, staking collateral, and governance weight. Its economic model is designed
                            for long-term deflationary pressure while maintaining sufficient liquidity for network operations.
                        </p>
                        <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                            DNR has a hardcoded fixed supply of <strong>500,000,000,000 tokens (500 Billion DNR)</strong>.
                            At genesis, <strong>10,000,000,000 DNR (10 Billion, 2% of total supply)</strong> enter active circulation,
                            distributed across foundation, validator, faucet, and owner accounts. The remaining
                            <strong> 490 Billion DNR (98%)</strong> is split equally across two on-chain treasury accounts
                            — the <em>Foundation Treasury</em> and the <em>Ecosystem Growth Treasury</em> — each holding
                            245 Billion DNR, governed by time-locked release schedules and multi-sig governance.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <StatCard value="DNR" label="Symbol" />
                            <StatCard value="18" label="Decimals" />
                            <StatCard value="500B" label="Total Supply" />
                            <StatCard value="10B" label="Circulating" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Supply Distribution (500B DNR)</h4>
                            <div className="space-y-3">
                                <DistributionBar label="Foundation Treasury" percent="49%" amount="245,000,000,000 DNR — time-locked, governance-released" color="bg-purple-500" />
                                <DistributionBar label="Ecosystem Growth Treasury" percent="49%" amount="245,000,000,000 DNR — grants, partnerships, incentives" color="bg-cyan-500" />
                                <DistributionBar label="Genesis Circulation" percent="2%" amount="10,000,000,000 DNR — validators, faucet, foundation operations" color="bg-neon-green" />
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-4">Total Supply: 500,000,000,000 DNR • Smallest Unit: 1 satoshi = 10⁻¹⁸ DNR</p>
                            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 mt-4">
                                <p className="text-xs text-cyan-300 font-bold mb-1">🔒 Treasury Release Policy</p>
                                <p className="text-xs text-gray-400 leading-relaxed">Both treasury accounts are time-locked smart contracts. Release tranches require multi-sig approval from the Foundation Council and a 14-day on-chain governance vote.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deflationary Mechanics</h4>
                            <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-bold text-sm">Base Fee Burn</span>
                                    <span className="text-red-400 font-mono font-bold">50%</span>
                                </div>
                                <p className="text-xs text-gray-500">Half of all transaction base fees are permanently burned, removing tokens from circulation. The other 50% goes to the block proposer as direct revenue.</p>
                            </div>
                            <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-bold text-sm">Emission Halving</span>
                                    <span className="text-cyan-400 font-mono font-bold">-10% / Year</span>
                                </div>
                                <p className="text-xs text-gray-500">Block rewards decrease by 10% every 4,320,000 blocks (~1 year). Year 1 maximum emission: ~63M DNR. By year 10, block rewards fall below 2 DNR.</p>
                            </div>
                            <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300 font-bold text-sm">Slashing Burns</span>
                                    <span className="text-orange-400 font-mono font-bold">1-100%</span>
                                </div>
                                <p className="text-xs text-gray-500">Slashed validator stake is burned, not redistributed. Byzantine attacks result in 100% stake destruction, providing an additional deflationary mechanism.</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ═══════════════════════════ ADDRESSES ═══════════════════════════ */}
                <Section id="addresses" title="6. Extended Address Format" icon={<Hash className="text-orange-400" />}>
                    <p className="mb-6">
                        Kortana uses a unique <strong>24-byte extended address format</strong> that maintains full EVM compatibility
                        while providing additional security through an embedded checksum. This design prevents address
                        typos from resulting in lost funds — a problem that has caused millions of dollars in losses on other chains.
                    </p>
                    <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5 font-mono text-xs overflow-x-auto mb-8">
                        <p className="text-gray-500 mb-2">{'// Address structure: 24 bytes total'}</p>
                        <p className="text-cyan-400">[ 20 bytes: EVM-compatible address ] [ 4 bytes: SHA3-256 checksum ]</p>
                        <p className="text-gray-500 mt-3">{'// Derivation from public key:'}</p>
                        <p className="text-cyan-400">address = SHA3-256(public_key)[12..32]  // 20 bytes</p>
                        <p className="text-cyan-400">checksum = SHA3-256(address)[0..4]       // 4 bytes</p>
                        <p className="text-cyan-400">kortana_address = address || checksum    // 24 bytes</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BulletItem text="The first 20 bytes are identical to a standard Ethereum address, ensuring full compatibility with existing wallets, contracts, and tooling." />
                        <BulletItem text="The trailing 4-byte checksum is verified on every transaction, rejecting addresses with typos before they reach the mempool." />
                        <BulletItem text="Contract addresses include a special flag byte in the checksum, allowing the network to distinguish between EOAs and contract accounts without a state lookup." />
                        <BulletItem text="Hex encoding supports both 0x-prefixed (48 chars) and 0x-prefixed + checksum (50 chars) formats, with automatic detection." />
                    </div>
                </Section>

                {/* ═══════════════════════════ STATE ═══════════════════════════ */}
                <Section id="state" title="7. State Management" icon={<Database className="text-teal-400" />}>
                    <p className="mb-6">
                        Kortana&apos;s state layer is built on a <strong>Merkle-Patricia Trie</strong> with SHA3-256 hashing, providing
                        cryptographic proof of every account&apos;s state at any block height. The state root is included in every
                        block header, enabling light clients to verify account balances without downloading the full chain.
                    </p>

                    <h4 className="text-white font-bold mt-8 mb-4">Account Model</h4>
                    <p className="text-sm text-gray-400 mb-4">
                        Every account, whether an externally owned account (EOA) or a smart contract, is represented by
                        the same data structure in the state trie:
                    </p>
                    <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5 font-mono text-xs overflow-x-auto mb-6">
                        <p className="text-gray-500">{'// Account state fields'}</p>
                        <p className="text-cyan-400">address:     KortanaAddress  // 24-byte extended address</p>
                        <p className="text-cyan-400">nonce:       u64            // Transaction counter (replay protection)</p>
                        <p className="text-cyan-400">balance:     u128           // DNR balance in satoshi units</p>
                        <p className="text-cyan-400">code_hash:   [u8; 32]       // SHA3-256 hash of contract bytecode</p>
                        <p className="text-cyan-400">storage:     HashMap         // Contract key-value storage</p>
                        <p className="text-cyan-400">is_contract: bool           // Contract flag</p>
                    </div>

                    <h4 className="text-white font-bold mt-8 mb-4">Mempool & Transaction Ordering</h4>
                    <p className="text-sm text-gray-400">
                        The mempool holds up to <strong>10,000 pending transactions</strong>, ordered by gas price in a priority queue.
                        Transactions with identical gas prices are ordered by arrival time. The block selection algorithm
                        greedily fills blocks up to the 30M gas limit, prioritizing higher-paying transactions.
                        Transactions expire after 7 days (604,800 seconds) if not included in a block. Duplicate
                        transactions are detected by hash and rejected at insertion time.
                    </p>
                </Section>

                {/* ═══════════════════════════ NETWORK ═══════════════════════════ */}
                <Section id="network" title="8. Network Infrastructure" icon={<Server className="text-pink-400" />}>
                    <p>
                        Kortana&apos;s networking layer is built on <strong>libp2p</strong>, the same peer-to-peer framework used by
                        Polkadot, Filecoin, and IPFS. This provides battle-tested primitives for peer discovery, encrypted
                        communication, and efficient message propagation across a globally distributed validator set.
                    </p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NetworkSpec label="P2P Framework" value="libp2p" />
                        <NetworkSpec label="Encryption" value="Noise Protocol" />
                        <NetworkSpec label="Discovery" value="Kademlia DHT" />
                        <NetworkSpec label="Propagation" value="Gossipsub" />
                        <NetworkSpec label="Max Mempool" value="10,000 Tx" />
                        <NetworkSpec label="Active Validators" value="50 Nodes" />
                        <NetworkSpec label="Block Gas Limit" value="30,000,000" />
                        <NetworkSpec label="Storage Engine" value="RocksDB" />
                        <NetworkSpec label="Peer ID" value="32-byte Ed25519" />
                        <NetworkSpec label="NAT Traversal" value="AutoNAT + Relay" />
                        <NetworkSpec label="Tx Gas Limit" value="10,000,000 max" />
                        <NetworkSpec label="Min Gas/Tx" value="21,000" />
                    </div>

                    <h4 className="text-white font-bold mt-10 mb-4">Persistence Architecture</h4>
                    <p className="text-sm text-gray-400">
                        All chain data is stored in a tuned RocksDB instance organized into four column families:
                        the <strong>block store</strong> indexes blocks by height, hash, and slot for O(1) lookups;
                        the <strong>state store</strong> persists account tries with snapshot support;
                        the <strong>receipt store</strong> maps transaction hashes to execution results; and
                        the <strong>index store</strong> maintains reverse mappings from addresses to their transaction history,
                        enabling the explorer API to serve address pages without full-chain scans.
                    </p>
                </Section>

            </div>
        </div>
    );
}

/* ═══════════ SUB-COMPONENTS ═══════════ */

function Section({ id, title, icon, children }: { id: string, title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-32">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white">{icon}</div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">{title}</h2>
                </div>
                <div className="text-gray-400 font-medium leading-relaxed">{children}</div>
                <div className="mt-16 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            </motion.div>
        </section>
    );
}

function NavItem({ label, icon, active, onClick }: { id: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <span className={active ? 'opacity-100' : 'opacity-70'}>{icon}</span>
            {label}
            {active && <ChevronRight size={14} className="ml-auto" />}
        </button>
    );
}

function StatCard({ value, label }: { value: string, label: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 text-center">
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}

function ArchitectureItem({ layer, desc }: { layer: string, desc: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/2 border border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-36 shrink-0">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/20">{layer}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}

function PrincipleCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-5 rounded-xl bg-white/2 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-400">{icon}</span>
                <h5 className="text-white font-bold text-sm">{title}</h5>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}

function BulletItem({ text }: { text: string }) {
    return (
        <li className="flex gap-3">
            <CheckCircle size={18} className="text-cyan-400 shrink-0 mt-1" />
            <span>{text}</span>
        </li>
    );
}

function SlashCard({ severity, title, penalty, desc, color }: { severity: string, title: string, penalty: string, desc: string, color: string }) {
    return (
        <div className="glass-panel p-6 rounded-xl bg-white/2 border-white/5">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={color} />
                    <span className="text-white font-bold text-sm">{title}</span>
                </div>
                <span className={`${color} font-mono font-bold text-sm`}>-{penalty}</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${color} bg-white/5 px-2 py-0.5 rounded-full`}>{severity}</span>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">{desc}</p>
        </div>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider">{children}</span>
    );
}

function DistributionBar({ label, percent, amount, color }: { label: string, percent: string, amount: string, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                <span>{label}</span>
                <span className="text-white">{percent}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: percent }}></div>
            </div>
            <p className="text-[10px] text-gray-600 mt-1 font-mono">{amount}</p>
        </div>
    );
}

function NetworkSpec({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center p-4 border-b border-white/5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-mono text-cyan-400">{value}</span>
        </div>
    );
}
