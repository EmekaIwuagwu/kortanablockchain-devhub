import { NETWORK } from './rpc';

export async function connectWallet() {
    if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
        try {
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        } catch (error) {
            console.error("User denied account access", error);
            return null;
        }
    } else {
        alert("Please install MetaMask to use this feature!");
        window.open('https://metamask.io/download/', '_blank');
        return null;
    }
}

export async function addKortanaNetwork() {
    if (typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined') {
        try {
            await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: NETWORK.mainnet.chainIdHex,
                        chainName: NETWORK.mainnet.name,
                        nativeCurrency: {
                            name: 'Kortana DNR',
                            symbol: NETWORK.mainnet.symbol,
                            decimals: 18,
                        },
                        rpcUrls: [NETWORK.mainnet.rpcUrl],
                        blockExplorerUrls: [NETWORK.mainnet.explorerUrl],
                    },
                ],
            });
            return true;
        } catch (error) {
            console.error("Error adding network to MetaMask", error);
            return false;
        }
    } else {
        alert("Please install MetaMask to use this feature!");
        window.open('https://metamask.io/download/', '_blank');
        return false;
    }
}
