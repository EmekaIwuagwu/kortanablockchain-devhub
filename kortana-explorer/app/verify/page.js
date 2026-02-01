'use client';

import React, { useState } from 'react';
import { Shield, Code, ChevronRight, Upload, CheckCircle2 } from 'lucide-react';

const VerifyPage = () => {
    const [step, setStep] = useState(1);
    const [address, setAddress] = useState('');

    const handleNext = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    return (
        <div className="container" style={{ padding: '4rem 2rem' }}>
            <div className="max-width: 800px; margin: 0 auto;">
                <h1 className="font-heading" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Verify & Publish Contract</h1>
                <p className="text-dim mb-8">Let users interact with your source code by matching it to the byte-code on-chain.</p>

                <div className="flex gap-4 mb-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2">
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: step >= i ? 'var(--primary)' : 'var(--surface)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700'
                            }}>
                                {step > i ? <CheckCircle2 size={16} /> : i}
                            </div>
                            <span className={step >= i ? 'text-white' : 'text-dim'}>
                                {i === 1 ? 'Details' : i === 2 ? 'Source Code' : 'Verify'}
                            </span>
                            {i < 3 && <ChevronRight size={16} className="text-dim" />}
                        </div>
                    ))}
                </div>

                <div className="glass-card">
                    {step === 1 && (
                        <form onSubmit={handleNext}>
                            <div className="mb-6">
                                <label className="text-dim text-small font-heading block mb-2">CONTRACT ADDRESS</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="0x..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="text-dim text-small font-heading block mb-2">COMPILER TYPE</label>
                                <select className="search-input" style={{ appearance: 'auto' }}>
                                    <option>Solidity (Single File)</option>
                                    <option>Solidity (Standard JSON-Input)</option>
                                    <option>Vyper</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Continue
                                <ChevronRight size={18} />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="mb-6">
                                <label className="text-dim text-small font-heading block mb-2">SOURCE CODE</label>
                                <textarea
                                    className="search-input"
                                    style={{ height: '300px', fontFamily: 'monospace', fontSize: '0.9rem' }}
                                    placeholder="// SPDX-License-Identifier: MIT..."
                                ></textarea>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="btn" style={{ background: 'var(--surface)', color: 'white' }}>Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary">Verify Contract</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="empty-icon" style={{ margin: '0 auto 1.5rem', background: 'rgba(0, 245, 212, 0.1)', color: 'var(--accent)' }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 className="font-heading mb-2">Verification In Progress</h2>
                            <p className="text-dim text-small mb-6">Our nodes are recompiling your source and comparing it with 0x... bytecode.</p>
                            <button onClick={() => setStep(1)} className="btn btn-primary">Done</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;
