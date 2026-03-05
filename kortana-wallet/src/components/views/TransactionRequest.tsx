"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/useWalletStore";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, XCircle, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { vaultService } from "@/lib/VaultService";
import { createWalletFromMnemonic } from "@/lib/wallet";

interface PendingTransaction {
    from: string;
    to: string;
    value?: string;
    gas?: string;
    gasPrice?: string;
    data?: string;
    reqId: string;
    status: "pending" | "complete" | "rejected";
    rpcUrl: string;
    chainId: number;
}

export const TransactionRequest: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    const [tx, setTx] = useState<PendingTransaction | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [derivedPrivateKey, setDerivedPrivateKey] = useState<string | null>(null);

    const { encryptedMnemonic, passwordHash } = useWalletStore();

    useEffect(() => {
        if (typeof chrome === "undefined" || !chrome.storage?.session) return;
        chrome.storage.session.get("pendingTransaction", (data: any) => {
            if (data.pendingTransaction?.status === "pending") {
                setTx(data.pendingTransaction);
            }
        });
    }, []);

    const handleUnlock = () => {
        if (!password || !encryptedMnemonic) {
            setError("Please enter your password.");
            return;
        }
        const inputHash = vaultService.hashPassword(password);
        if (inputHash !== passwordHash) {
            setError("Incorrect password. Please try again.");
            return;
        }
        const mnemonic = vaultService.decrypt(encryptedMnemonic, password);
        if (!mnemonic) {
            setError("Decryption failed. Data may be corrupted.");
            return;
        }
        const wallet = createWalletFromMnemonic(mnemonic);
        setDerivedPrivateKey(wallet.privateKey);
        setError(null);
    };

    const handleSend = async () => {
        if (!derivedPrivateKey || !tx) return;
        setSending(true);
        setError(null);

        try {
            // Create provider pointing to the Kortana RPC
            const provider = new ethers.JsonRpcProvider(tx.rpcUrl, {
                chainId: tx.chainId,
                name: 'kortana',
            });

            const wallet = new ethers.Wallet(derivedPrivateKey, provider);

            // Build the transaction — wallet handles nonce, gasPrice automatically
            const txRequest: ethers.TransactionRequest = {
                to: tx.to,
                value: tx.value ? BigInt(tx.value) : BigInt(0),
                data: tx.data || '0x',
                chainId: tx.chainId,
            };

            // Use provided gas or let ethers estimate
            if (tx.gas) txRequest.gasLimit = BigInt(tx.gas);
            if (tx.gasPrice) txRequest.gasPrice = BigInt(tx.gasPrice);

            const response = await wallet.sendTransaction(txRequest);
            const txHash = response.hash;

            // Write result back — background.js will pick this up
            await chrome.storage.session.set({
                pendingTransaction: { ...tx, status: "complete", txHash },
            });

            window.close();
        } catch (e: any) {
            console.error("[Kortana] Transaction failed:", e);
            setError(e?.shortMessage || e?.message || "Transaction failed.");
            setSending(false);
        }
    };

    const handleReject = async () => {
        if (!tx) { window.close(); return; }
        try {
            await chrome.storage.session.set({
                pendingTransaction: { ...tx, status: "rejected" },
            });
        } catch (e) { /* ignore */ }
        window.close();
    };

    if (!tx) return null;

    // Format value for display
    const valueInDNR = tx.value
        ? parseFloat(ethers.formatEther(BigInt(tx.value))).toFixed(4)
        : "0";

    const shortAddr = (addr: string) => addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : "—";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-screen flex flex-col items-center justify-start pt-6 p-4 bg-deep-space overflow-hidden"
        >
            <div className="w-full max-w-sm glass-panel rounded-3xl p-5 space-y-3">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/images/logo.png" alt="Kortana" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase">
                        Authorize Payment
                    </h1>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                        BelloMundo is requesting a settlement
                    </p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-2">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex justify-between items-center">
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Amount</span>
                        <span className="text-white font-black text-lg">◈ {valueInDNR} <span className="text-[10px] text-gray-400">DNR</span></span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">From</p>
                        <p className="text-[11px] text-white font-mono">{shortAddr(tx.from)}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">To (Treasury)</p>
                        <p className="text-[11px] text-white font-mono">{shortAddr(tx.to)}</p>
                    </div>
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-3 flex items-start gap-2">
                        <AlertTriangle size={10} className="text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-amber-400/80 font-bold uppercase tracking-wider">
                            This will send DNR from your wallet. Action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                {/* Password Unlock */}
                {!derivedPrivateKey ? (
                    <div className="space-y-3">
                        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                            <Lock size={10} className="inline mr-1" />
                            Enter your password to authorize
                        </p>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
                                placeholder="Wallet password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReject}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                            >
                                <XCircle size={12} /> Reject
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-400 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-all"
                            >
                                <Lock size={12} /> Unlock
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} />
                            Wallet Unlocked — Ready to Send
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReject}
                                disabled={sending}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                                <XCircle size={12} /> Reject
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-400 text-black text-[11px] font-black uppercase tracking-widest hover:bg-amber-300 transition-all disabled:opacity-50"
                            >
                                <Zap size={12} />
                                {sending ? "Sending..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
