import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

function generateKortanaAddress() {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    console.log('--- GENERATED KORTANA WALLET FOR DEMO ---');
    console.log(`Address: ${account.address}`);
    console.log(`Private Key: ${privateKey}`);
    console.log('-----------------------------------------');
}

generateKortanaAddress();
