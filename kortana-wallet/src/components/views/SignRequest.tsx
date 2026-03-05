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
        <div className="grid place-items-center h-screen w-screen bg-deep-space overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] nebula-purple opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] nebula-cyan opacity-30" />
                <div className="grainy-overlay" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="w-full max-w-sm glass-panel rounded-[2.5rem] p-6 space-y-4 relative z-10 border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
            >
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-1 pb-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden mb-2 bg-white/5 border border-white/10 p-2 shadow-inner">
                        <img src="/images/logo.png" alt="Kortana" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                        Sign Request
                    </h1>
                    <p className="text-cyan-400 text-[9px] uppercase tracking-[0.3em] font-bold">
                        BelloMundo Authorization
                    </p>
                </div>

                {/* From & Message */}
                <div className="space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 shadow-inner">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Enclave Address</p>
                        <p className="text-[10px] text-white font-mono break-all leading-tight opacity-80">{request.from}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 shadow-inner">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black mb-1">Digital Signature Payload</p>
                        <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-24 overflow-y-auto custom-scrollbar opacity-60">
                            {displayMessage}
                        </pre>
                    </div>
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
            </motion.div>
        </div>
    );
};

