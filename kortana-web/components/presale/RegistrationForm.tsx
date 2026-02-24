"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Mail, User, Phone, Globe, ShieldCheck, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

interface RegistrationFormProps {
    selectedTier: string;
    onSuccess: (data: any) => void;
}

export default function RegistrationForm({ selectedTier, onSuccess }: RegistrationFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        walletAddress: '',
        tier: selectedTier,
        terms: false
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [referralData, setReferralData] = useState<{ link: string; code: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.tier) {
            setError('Please select a contribution tier first.');
            return;
        }

        setStatus('loading');
        setError('');

        try {
            // Get referral code from URL if exists
            const urlParams = new URLSearchParams(window.location.search);
            const referralCode = urlParams.get('ref');

            const response = await fetch('/api/presale/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, referralCode }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setReferralData({ link: data.referralLink, code: data.referralCode });
                onSuccess(data);
            } else {
                setStatus('error');
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            setError('A network error occurred. Please check your connection.');
        }
    };

    const copyRefLink = () => {
        if (referralData) {
            navigator.clipboard.writeText(referralData.link);
            // Optional: Add a toast notification here
        }
    };

    if (status === 'success' && referralData) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-indigo-600/10 rounded-3xl border border-indigo-500/30"
            >
                <div className="flex justify-center mb-6 text-green-500">
                    <CheckCircle size={64} />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 font-space">Welcome to the Revolution!</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Your registration for the <strong>{formData.tier.toUpperCase()}</strong> tier is complete.
                    Check your email <strong>({formData.email})</strong> for confirmation and next steps.
                </p>

                <div className="bg-deep-space p-6 rounded-2xl border border-white/10 mb-8 max-w-md mx-auto">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Your Unique Referral Link</p>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white/5 p-3 rounded-lg text-xs text-indigo-400 font-mono truncate border border-white/5">
                            {referralData.link}
                        </div>
                        <button
                            onClick={copyRefLink}
                            className="p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 leading-relaxed line-clamp-2 italic">
                        "Share this link and earn 10% bonus tokens for every successful referral who joins the presale!"
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 bg-indigo-600 rounded-xl font-bold text-sm">Join Telegram Community</button>
                    <button className="px-8 py-3 bg-white/10 rounded-xl font-bold text-sm">Follow on X (Twitter)</button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white font-space">Whitelist Registration</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Tier: <span className="text-indigo-400 font-bold">{selectedTier.toUpperCase() || 'SELECT ONE'}</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} /> Full Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Investor"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="investor@example.com"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={12} /> Phone Number
                        </label>
                        <input
                            required
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} /> Country
                        </label>
                        <select
                            required
                            className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white transition text-sm appearance-none"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        >
                            <option value="" disabled className="bg-deep-space">Select Country</option>
                            <option value="AF" className="bg-deep-space">Afghanistan</option>
                            <option value="AL" className="bg-deep-space">Albania</option>
                            <option value="DZ" className="bg-deep-space">Algeria</option>
                            <option value="AD" className="bg-deep-space">Andorra</option>
                            <option value="AO" className="bg-deep-space">Angola</option>
                            <option value="AG" className="bg-deep-space">Antigua and Barbuda</option>
                            <option value="AR" className="bg-deep-space">Argentina</option>
                            <option value="AM" className="bg-deep-space">Armenia</option>
                            <option value="AU" className="bg-deep-space">Australia</option>
                            <option value="AT" className="bg-deep-space">Austria</option>
                            <option value="AZ" className="bg-deep-space">Azerbaijan</option>
                            <option value="BS" className="bg-deep-space">Bahamas</option>
                            <option value="BH" className="bg-deep-space">Bahrain</option>
                            <option value="BD" className="bg-deep-space">Bangladesh</option>
                            <option value="BB" className="bg-deep-space">Barbados</option>
                            <option value="BY" className="bg-deep-space">Belarus</option>
                            <option value="BE" className="bg-deep-space">Belgium</option>
                            <option value="BZ" className="bg-deep-space">Belize</option>
                            <option value="BJ" className="bg-deep-space">Benin</option>
                            <option value="BT" className="bg-deep-space">Bhutan</option>
                            <option value="BO" className="bg-deep-space">Bolivia</option>
                            <option value="BA" className="bg-deep-space">Bosnia and Herzegovina</option>
                            <option value="BW" className="bg-deep-space">Botswana</option>
                            <option value="BR" className="bg-deep-space">Brazil</option>
                            <option value="BN" className="bg-deep-space">Brunei</option>
                            <option value="BG" className="bg-deep-space">Bulgaria</option>
                            <option value="BF" className="bg-deep-space">Burkina Faso</option>
                            <option value="BI" className="bg-deep-space">Burundi</option>
                            <option value="CV" className="bg-deep-space">Cabo Verde</option>
                            <option value="KH" className="bg-deep-space">Cambodia</option>
                            <option value="CM" className="bg-deep-space">Cameroon</option>
                            <option value="CA" className="bg-deep-space">Canada</option>
                            <option value="CF" className="bg-deep-space">Central African Republic</option>
                            <option value="TD" className="bg-deep-space">Chad</option>
                            <option value="CL" className="bg-deep-space">Chile</option>
                            <option value="CN" className="bg-deep-space">China</option>
                            <option value="CO" className="bg-deep-space">Colombia</option>
                            <option value="KM" className="bg-deep-space">Comoros</option>
                            <option value="CG" className="bg-deep-space">Congo</option>
                            <option value="CR" className="bg-deep-space">Costa Rica</option>
                            <option value="HR" className="bg-deep-space">Croatia</option>
                            <option value="CU" className="bg-deep-space">Cuba</option>
                            <option value="CY" className="bg-deep-space">Cyprus</option>
                            <option value="CZ" className="bg-deep-space">Czechia</option>
                            <option value="DK" className="bg-deep-space">Denmark</option>
                            <option value="DJ" className="bg-deep-space">Djibouti</option>
                            <option value="DM" className="bg-deep-space">Dominica</option>
                            <option value="DO" className="bg-deep-space">Dominican Republic</option>
                            <option value="EC" className="bg-deep-space">Ecuador</option>
                            <option value="EG" className="bg-deep-space">Egypt</option>
                            <option value="SV" className="bg-deep-space">El Salvador</option>
                            <option value="GQ" className="bg-deep-space">Equatorial Guinea</option>
                            <option value="ER" className="bg-deep-space">Eritrea</option>
                            <option value="EE" className="bg-deep-space">Estonia</option>
                            <option value="SZ" className="bg-deep-space">Eswatini</option>
                            <option value="ET" className="bg-deep-space">Ethiopia</option>
                            <option value="FJ" className="bg-deep-space">Fiji</option>
                            <option value="FI" className="bg-deep-space">Finland</option>
                            <option value="FR" className="bg-deep-space">France</option>
                            <option value="GA" className="bg-deep-space">Gabon</option>
                            <option value="GM" className="bg-deep-space">Gambia</option>
                            <option value="GE" className="bg-deep-space">Georgia</option>
                            <option value="DE" className="bg-deep-space">Germany</option>
                            <option value="GH" className="bg-deep-space">Ghana</option>
                            <option value="GR" className="bg-deep-space">Greece</option>
                            <option value="GD" className="bg-deep-space">Grenada</option>
                            <option value="GT" className="bg-deep-space">Guatemala</option>
                            <option value="GN" className="bg-deep-space">Guinea</option>
                            <option value="GW" className="bg-deep-space">Guinea-Bissau</option>
                            <option value="GY" className="bg-deep-space">Guyana</option>
                            <option value="HT" className="bg-deep-space">Haiti</option>
                            <option value="HN" className="bg-deep-space">Honduras</option>
                            <option value="HU" className="bg-deep-space">Hungary</option>
                            <option value="IS" className="bg-deep-space">Iceland</option>
                            <option value="IN" className="bg-deep-space">India</option>
                            <option value="ID" className="bg-deep-space">Indonesia</option>
                            <option value="IR" className="bg-deep-space">Iran</option>
                            <option value="IQ" className="bg-deep-space">Iraq</option>
                            <option value="IE" className="bg-deep-space">Ireland</option>
                            <option value="IL" className="bg-deep-space">Israel</option>
                            <option value="IT" className="bg-deep-space">Italy</option>
                            <option value="JM" className="bg-deep-space">Jamaica</option>
                            <option value="JP" className="bg-deep-space">Japan</option>
                            <option value="JO" className="bg-deep-space">Jordan</option>
                            <option value="KZ" className="bg-deep-space">Kazakhstan</option>
                            <option value="KE" className="bg-deep-space">Kenya</option>
                            <option value="KI" className="bg-deep-space">Kiribati</option>
                            <option value="KP" className="bg-deep-space">North Korea</option>
                            <option value="KR" className="bg-deep-space">South Korea</option>
                            <option value="KW" className="bg-deep-space">Kuwait</option>
                            <option value="KG" className="bg-deep-space">Kyrgyzstan</option>
                            <option value="LA" className="bg-deep-space">Laos</option>
                            <option value="LV" className="bg-deep-space">Latvia</option>
                            <option value="LB" className="bg-deep-space">Lebanon</option>
                            <option value="LS" className="bg-deep-space">Lesotho</option>
                            <option value="LR" className="bg-deep-space">Liberia</option>
                            <option value="LY" className="bg-deep-space">Libya</option>
                            <option value="LI" className="bg-deep-space">Liechtenstein</option>
                            <option value="LT" className="bg-deep-space">Lithuania</option>
                            <option value="LU" className="bg-deep-space">Luxembourg</option>
                            <option value="MG" className="bg-deep-space">Madagascar</option>
                            <option value="MW" className="bg-deep-space">Malawi</option>
                            <option value="MY" className="bg-deep-space">Malaysia</option>
                            <option value="MV" className="bg-deep-space">Maldives</option>
                            <option value="ML" className="bg-deep-space">Mali</option>
                            <option value="MT" className="bg-deep-space">Malta</option>
                            <option value="MH" className="bg-deep-space">Marshall Islands</option>
                            <option value="MR" className="bg-deep-space">Mauritania</option>
                            <option value="MU" className="bg-deep-space">Mauritius</option>
                            <option value="MX" className="bg-deep-space">Mexico</option>
                            <option value="FM" className="bg-deep-space">Micronesia</option>
                            <option value="MD" className="bg-deep-space">Moldova</option>
                            <option value="MC" className="bg-deep-space">Monaco</option>
                            <option value="MN" className="bg-deep-space">Mongolia</option>
                            <option value="ME" className="bg-deep-space">Montenegro</option>
                            <option value="MA" className="bg-deep-space">Morocco</option>
                            <option value="MZ" className="bg-deep-space">Mozambique</option>
                            <option value="MM" className="bg-deep-space">Myanmar</option>
                            <option value="NA" className="bg-deep-space">Namibia</option>
                            <option value="NR" className="bg-deep-space">Nauru</option>
                            <option value="NP" className="bg-deep-space">Nepal</option>
                            <option value="NL" className="bg-deep-space">Netherlands</option>
                            <option value="NZ" className="bg-deep-space">New Zealand</option>
                            <option value="NI" className="bg-deep-space">Nicaragua</option>
                            <option value="NE" className="bg-deep-space">Niger</option>
                            <option value="NG" className="bg-deep-space">Nigeria</option>
                            <option value="MK" className="bg-deep-space">North Macedonia</option>
                            <option value="NO" className="bg-deep-space">Norway</option>
                            <option value="OM" className="bg-deep-space">Oman</option>
                            <option value="PK" className="bg-deep-space">Pakistan</option>
                            <option value="PW" className="bg-deep-space">Palau</option>
                            <option value="PS" className="bg-deep-space">Palestine</option>
                            <option value="PA" className="bg-deep-space">Panama</option>
                            <option value="PG" className="bg-deep-space">Papua New Guinea</option>
                            <option value="PY" className="bg-deep-space">Paraguay</option>
                            <option value="PE" className="bg-deep-space">Peru</option>
                            <option value="PH" className="bg-deep-space">Philippines</option>
                            <option value="PL" className="bg-deep-space">Poland</option>
                            <option value="PT" className="bg-deep-space">Portugal</option>
                            <option value="QA" className="bg-deep-space">Qatar</option>
                            <option value="RO" className="bg-deep-space">Romania</option>
                            <option value="RU" className="bg-deep-space">Russia</option>
                            <option value="RW" className="bg-deep-space">Rwanda</option>
                            <option value="KN" className="bg-deep-space">Saint Kitts and Nevis</option>
                            <option value="LC" className="bg-deep-space">Saint Lucia</option>
                            <option value="VC" className="bg-deep-space">Saint Vincent and the Grenadines</option>
                            <option value="WS" className="bg-deep-space">Samoa</option>
                            <option value="SM" className="bg-deep-space">San Marino</option>
                            <option value="ST" className="bg-deep-space">Sao Tome and Principe</option>
                            <option value="SA" className="bg-deep-space">Saudi Arabia</option>
                            <option value="SN" className="bg-deep-space">Senegal</option>
                            <option value="RS" className="bg-deep-space">Serbia</option>
                            <option value="SC" className="bg-deep-space">Seychelles</option>
                            <option value="SL" className="bg-deep-space">Sierra Leone</option>
                            <option value="SG" className="bg-deep-space">Singapore</option>
                            <option value="SK" className="bg-deep-space">Slovakia</option>
                            <option value="SI" className="bg-deep-space">Slovenia</option>
                            <option value="SB" className="bg-deep-space">Solomon Islands</option>
                            <option value="SO" className="bg-deep-space">Somalia</option>
                            <option value="ZA" className="bg-deep-space">South Africa</option>
                            <option value="SS" className="bg-deep-space">South Sudan</option>
                            <option value="ES" className="bg-deep-space">Spain</option>
                            <option value="LK" className="bg-deep-space">Sri Lanka</option>
                            <option value="SD" className="bg-deep-space">Sudan</option>
                            <option value="SR" className="bg-deep-space">Suriname</option>
                            <option value="SE" className="bg-deep-space">Sweden</option>
                            <option value="CH" className="bg-deep-space">Switzerland</option>
                            <option value="SY" className="bg-deep-space">Syria</option>
                            <option value="TW" className="bg-deep-space">Taiwan</option>
                            <option value="TJ" className="bg-deep-space">Tajikistan</option>
                            <option value="TZ" className="bg-deep-space">Tanzania</option>
                            <option value="TH" className="bg-deep-space">Thailand</option>
                            <option value="TL" className="bg-deep-space">Timor-Leste</option>
                            <option value="TG" className="bg-deep-space">Togo</option>
                            <option value="TO" className="bg-deep-space">Tonga</option>
                            <option value="TT" className="bg-deep-space">Trinidad and Tobago</option>
                            <option value="TN" className="bg-deep-space">Tunisia</option>
                            <option value="TR" className="bg-deep-space">Turkey</option>
                            <option value="TM" className="bg-deep-space">Turkmenistan</option>
                            <option value="TV" className="bg-deep-space">Tuvalu</option>
                            <option value="UG" className="bg-deep-space">Uganda</option>
                            <option value="UA" className="bg-deep-space">Ukraine</option>
                            <option value="AE" className="bg-deep-space">United Arab Emirates</option>
                            <option value="UY" className="bg-deep-space">Uruguay</option>
                            <option value="UZ" className="bg-deep-space">Uzbekistan</option>
                            <option value="VU" className="bg-deep-space">Vanuatu</option>
                            <option value="VE" className="bg-deep-space">Venezuela</option>
                            <option value="VN" className="bg-deep-space">Vietnam</option>
                            <option value="YE" className="bg-deep-space">Yemen</option>
                            <option value="ZM" className="bg-deep-space">Zambia</option>
                            <option value="ZW" className="bg-deep-space">Zimbabwe</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={12} /> ERC-20 Wallet Address
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="0x..."
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 outline-none p-4 rounded-xl text-white font-mono transition text-sm"
                        value={formData.walletAddress}
                        onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-500 italic">Please use a wallet you control (MetaMask, TrustWallet). Do NOT use exchange addresses.</p>
                </div>

                <div className="pt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            required
                            type="checkbox"
                            className="w-5 h-5 rounded bg-white/10 border-white/20 checked:bg-indigo-600 transition"
                            checked={formData.terms}
                            onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                        />
                        <span className="text-xs text-gray-400 group-hover:text-gray-300 transition leading-relaxed">
                            I agree to the <a href="#" className="text-indigo-400 underline hov:no-underline">Terms of Service</a> and <a href="#" className="text-indigo-400 underline hov:no-underline">Privacy Policy</a>
                        </span>
                    </label>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold"
                        >
                            <AlertTriangle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex justify-center items-center shadow-2xl ${status === 'loading'
                        ? 'bg-indigo-600/50 cursor-wait'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                        }`}
                >
                    {status === 'loading' ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : 'Secure My Spot Now'}
                </button>
            </form>
        </div>
    );
}
