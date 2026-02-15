import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
const pk = generatePrivateKey();
const acc = privateKeyToAccount(pk);
process.stdout.write(acc.address + '\n' + pk);
process.exit(0);
