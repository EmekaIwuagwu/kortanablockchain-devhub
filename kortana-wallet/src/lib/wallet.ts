import { Wallet, Mnemonic, HDNodeWallet, ethers } from 'ethers';

export const generateMnemonic = (): string => {
    const entropy = ethers.randomBytes(16); // 128 bits for 12 word mnemonic
    return Mnemonic.fromEntropy(entropy).phrase;
};

export const createWalletFromMnemonic = (mnemonic: string, accountIndex: number = 0): HDNodeWallet => {
    const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
    const path = `m/44'/60'/0'/0/${accountIndex}`;
    return HDNodeWallet.fromMnemonic(mnemonicObj, path);
};

export const createWalletFromPrivateKey = (privateKey: string): Wallet => {
    return new Wallet(privateKey);
};
