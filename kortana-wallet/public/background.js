/**
 * Kortana Wallet - Background Service Worker
 * Professional Edition - Robust Request Handling & Auto-Popup
 */

const NETWORKS = {
    mainnet: { rpc: 'https://zeus-rpc.mainnet.kortana.xyz', chainId: 7251 },
    testnet: { rpc: 'https://poseidon-rpc.testnet.kortana.xyz/', chainId: 72511 },
    sepolia: { rpc: 'https://rpc.ankr.com/eth_sepolia', chainId: 11155111 },
    avalancheFuji: { rpc: 'https://api.avax-test.network/ext/bc/C/rpc', chainId: 43113 },
    baseSepolia: { rpc: 'https://sepolia.base.org', chainId: 84532 }
};

let currentNetwork = 'testnet';

// Listen for messages from the inpage provider (via content script)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.source !== 'kortana-inpage') return;
    handleRequest(request).then(sendResponse).catch((err) => {
        sendResponse({ error: { code: -32603, message: err.message || 'Internal error' } });
    });
    return true;
});

// Helper to get the persisted state from local storage
async function getStoredState() {
    const data = await chrome.storage.local.get('kortana-wallet-secure-storage');
    if (data['kortana-wallet-secure-storage']) {
        try {
            const parsed = JSON.parse(data['kortana-wallet-secure-storage']);
            return parsed.state || {};
        } catch (e) {
            return {};
        }
    }
    return {};
}

// Open the wallet popup securely with fixed dimensions
async function openPopup() {
    const popupUrl = chrome.runtime.getURL('index.html');
    try {
        const windows = await chrome.windows.getAll({ populate: true });
        const existing = windows.find(w =>
            w.type === 'popup' && w.tabs?.some(t => t.url?.startsWith(popupUrl))
        );
        if (existing && existing.id) {
            await chrome.windows.update(existing.id, { focused: true, width: 420, height: 620 });
            return;
        }
    } catch (e) { /* ignore */ }

    await chrome.windows.create({
        url: popupUrl,
        type: 'popup',
        width: 420,
        height: 620,
        focused: true
    });
}

// Relentless window size enforcement to prevent maximization/resizing
chrome.windows.onBoundsChanged.addListener((win) => {
    chrome.windows.get(win.id, { populate: true }, (fullWin) => {
        if (fullWin.type === 'popup' && fullWin.tabs?.[0]?.url?.includes(chrome.runtime.id)) {
            if (fullWin.width !== 420 || fullWin.height !== 620 || fullWin.state !== 'normal') {
                chrome.windows.update(win.id, { width: 420, height: 620, state: 'normal' });
            }
        }
    });
});

// Polling helper for when a DApp is waiting for the user to unlock the wallet
async function waitForAccountAccess(timeoutMs = 120000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 1000));
        const state = await getStoredState();
        if (state.address && state.isLocked === false) {
            return { result: [state.address] };
        }
    }
    return { error: { code: 4001, message: 'Login request timed out. Please unlock the wallet.' } };
}

// Polling helper for signatures
async function waitForSignature(timeoutMs = 120000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 500));
        const data = await chrome.storage.session.get('pendingSign');
        if (data.pendingSign?.status === 'complete') {
            const sig = data.pendingSign.signature;
            await chrome.storage.session.remove('pendingSign');
            return { result: sig };
        }
        if (data.pendingSign?.status === 'rejected') {
            await chrome.storage.session.remove('pendingSign');
            return { error: { code: 4001, message: 'User rejected the signing request.' } };
        }
    }
    await chrome.storage.session.remove('pendingSign');
    return { error: { code: 4001, message: 'Sign request timed out.' } };
}

// Polling helper for transactions
async function waitForTransaction(timeoutMs = 120000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 500));
        const data = await chrome.storage.session.get('pendingTransaction');
        if (data.pendingTransaction?.status === 'complete') {
            const txHash = data.pendingTransaction.txHash;
            await chrome.storage.session.remove('pendingTransaction');
            return { result: txHash };
        }
        if (data.pendingTransaction?.status === 'rejected') {
            await chrome.storage.session.remove('pendingTransaction');
            return { error: { code: 4001, message: 'User rejected the transaction.' } };
        }
    }
    await chrome.storage.session.remove('pendingTransaction');
    return { error: { code: 4001, message: 'Transaction request timed out.' } };
}

// Main RPC request handler
async function handleRequest(request) {
    const { method, params } = request;
    const state = await getStoredState();

    currentNetwork = state.network || 'testnet';
    const network = NETWORKS[currentNetwork] || NETWORKS.testnet;
    const address = state.address;
    const isLocked = state.isLocked !== false;

    switch (method) {
        case 'eth_accounts':
            if (isLocked || !address) return { result: [] };
            return { result: [address] };

        case 'eth_requestAccounts':
            // If locked, open the wallet and WAIT for the user to unlock
            if (isLocked || !address) {
                await openPopup();
                return await waitForAccountAccess(180000); // 3 minute window to unlock
            }
            return { result: [address] };

        case 'eth_chainId':
            return { result: '0x' + network.chainId.toString(16) };

        case 'net_version':
            return { result: network.chainId.toString() };

        case 'personal_sign':
        case 'eth_sign': {
            if (isLocked || !address) {
                await openPopup();
                // Wait for unlock first, then proceed with the sign request logic
                const access = await waitForAccountAccess(60000);
                if (access.error) return access;
            }

            const message = params[0];
            const from = params[1] || address;
            const reqId = Date.now().toString();

            await chrome.storage.session.set({
                pendingSign: { message, from, reqId, status: 'pending' }
            });

            await openPopup();
            return await waitForSignature(120000);
        }

        case 'eth_sendTransaction': {
            if (isLocked || !address) {
                await openPopup();
                const access = await waitForAccountAccess(60000);
                if (access.error) return access;
            }

            const txParams = params?.[0];
            if (!txParams) return { error: { code: -32602, message: 'Missing transaction parameters.' } };

            const reqId = Date.now().toString();

            await chrome.storage.session.set({
                pendingTransaction: {
                    ...txParams,
                    reqId,
                    status: 'pending',
                    network: currentNetwork,
                    rpcUrl: network.rpc,
                    chainId: network.chainId,
                }
            });

            await openPopup();
            return await waitForTransaction(120000);
        }

        default:
            try {
                const response = await fetch(network.rpc, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: request.id || 1,
                        method,
                        params: params || []
                    })
                });
                const data = await response.json();
                return { result: data.result, error: data.error };
            } catch (error) {
                return { error: { code: -32603, message: 'Network request failed: ' + error.message } };
            }
    }
}
