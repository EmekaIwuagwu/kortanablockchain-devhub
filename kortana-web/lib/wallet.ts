
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
