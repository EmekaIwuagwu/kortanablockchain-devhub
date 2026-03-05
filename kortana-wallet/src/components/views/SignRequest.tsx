"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/useWalletStore";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, XCircle, Lock, Eye, EyeOff } from "lucide-react";
import { vaultService } from "@/lib/VaultService";
import { createWalletFromMnemonic } from "@/lib/wallet";

interface PendingSignRequest {
    message: string;
    from: string;
    reqId: string;
    status: "pending" | "complete" | "rejected";
}

export const SignRequest: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    const [request, setRequest] = useState<PendingSignRequest | null>(null);
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Password unlock state (private key is never persisted, needs password to re-derive)
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [derivedPrivateKey, setDerivedPrivateKey] = useState<string | null>(null);

    const { encryptedMnemonic, passwordHash } = useWalletStore();

    useEffect(() => {
        if (typeof chrome === "undefined" || !chrome.storage?.session) return;
        chrome.storage.session.get("pendingSign", (data: any) => {
            if (data.pendingSign?.status === "pending") {
                setRequest(data.pendingSign);
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

    const handleSign = async () => {
        if (!derivedPrivateKey || !request) return;
        setSigning(true);
        setError(null);
        try {
            const wallet = new ethers.Wallet(derivedPrivateKey);
            // ethers automatically prepends \x19Ethereum Signed Message prefix
            const signature = await wallet.signMessage(request.message);
            await chrome.storage.session.set({
                pendingSign: { ...request, status: "complete", signature },
            });
            // Close the popup window — background.js will detect the signature
            window.close();
        } catch (e: any) {
            console.error("[Kortana] Signing failed:", e);
            setError("Signing failed: " + (e.message || "Unknown error"));
            setSigning(false);
        }
    };

    const handleReject = async () => {
        if (!request) {
            window.close();
            return;
        }
        try {
            await chrome.storage.session.set({
                pendingSign: { ...request, status: "rejected" },
            });
        } catch (e) {
            // Even if storage fails, close the window
        }
        window.close();
    };

    if (!request) return null;

    const displayMessage = request.message.length > 400
        ? request.message.slice(0, 400) + "..."
        : request.message;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-screen flex flex-col items-center justify-start pt-6 p-4 bg-deep-space overflow-hidden"
        >
            <div className="w-full max-w-sm glass-panel rounded-3xl p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/images/logo.png" alt="Kortana" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase">
                        Sign Request
                    </h1>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                        BelloMundo is requesting your signature
                    </p>
                </div>

                {/* From */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">From</p>
                    <p className="text-[11px] text-white font-mono break-all">{request.from}</p>
                </div>

                {/* Message */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Message</p>
                    <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-32 overflow-y-auto">
                        {displayMessage}
                    </pre>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                {/* Password Unlock — needed because private key is memory-only */}
                {!derivedPrivateKey ? (
                    <div className="space-y-3">
                        <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                            <Lock size={10} className="inline mr-1" />
                            Enter your password to authorize signing
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
                                <XCircle size={12} />
                                Reject
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-400 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-all"
                            >
                                <Lock size={12} />
                                Unlock
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Unlocked — ready to sign */
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                            <CheckCircle2 size={12} />
                            Wallet Unlocked — Ready to Sign
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleReject}
                                disabled={signing}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                                <XCircle size={12} />
                                Reject
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={signing}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-400 text-black text-[11px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-all disabled:opacity-50"
                            >
                                <CheckCircle2 size={12} />
                                {signing ? "Signing..." : "Sign"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
