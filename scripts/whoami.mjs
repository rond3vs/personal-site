// Sanity-check the Algorand stamping account: prints the address + balance the
// configured ALGO_MNEMONIC resolves to, on the configured network. Sends nothing.
//
//   npm run stamp:whoami
//   ALGO_NETWORK=testnet npm run stamp:whoami
import algosdk from 'algosdk';
import { existsSync } from 'node:fs';

const inline = { network: process.env.ALGO_NETWORK, mnemonic: process.env.ALGO_MNEMONIC };
if (existsSync('.env')) process.loadEnvFile('.env');

const NETWORKS = {
  mainnet: 'https://mainnet-api.algonode.cloud',
  testnet: 'https://testnet-api.algonode.cloud',
};

const network = (inline.network ?? process.env.ALGO_NETWORK ?? 'mainnet').toLowerCase();
const api = NETWORKS[network];
if (!api) {
  console.error(`ALGO_NETWORK must be "mainnet" or "testnet" (got "${network}").`);
  process.exit(1);
}

const mnemonic = inline.mnemonic ?? process.env.ALGO_MNEMONIC;
if (!mnemonic) {
  console.error('Set ALGO_MNEMONIC in .env (copy .env.example) or on the command line.');
  process.exit(1);
}

const acct = algosdk.mnemonicToSecretKey(mnemonic);
const algod = new algosdk.Algodv2('', api, '');
const info = await algod.accountInformation(acct.addr).do();
const algo = Number(info.amount) / 1e6;

console.log(`\n  network: ${network}`);
console.log(`  address: ${acct.addr.toString()}`);
console.log(`  balance: ${algo} ALGO  (~${Math.floor(algo / 0.001)} stamps)\n`);
