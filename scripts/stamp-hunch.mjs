// Timestamp a blog post's body onto Algorand for tamper-proof "proof of
// existence". We hash ONLY the markdown body (frontmatter stripped), so adding
// proofHash/proofTxn back into frontmatter never invalidates the proof.
//
// Reads ALGO_MNEMONIC and ALGO_NETWORK from a .env file (or the environment),
// stamps the post, and writes proofHash/proofTxn straight into its frontmatter.
//
//   npm run stamp -- src/content/blog/your-post.md
//
// Override the network per-run if needed (default comes from .env, else mainnet):
//   ALGO_NETWORK=testnet npm run stamp -- src/content/blog/your-post.md
//
// Needs a funded account (~0.001 ALGO per stamp). The note field records the
// hash on-chain; anyone can re-derive the hash from the published post and
// confirm it against the transaction on a block explorer.
import algosdk from 'algosdk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Snapshot inline env vars (so `ALGO_NETWORK=testnet npm run stamp` wins),
// then load .env to fill in anything not set on the command line.
const inline = { network: process.env.ALGO_NETWORK, mnemonic: process.env.ALGO_MNEMONIC };
if (existsSync('.env')) process.loadEnvFile('.env');

const NETWORKS = {
  mainnet: { api: 'https://mainnet-api.algonode.cloud', explorer: 'https://allo.info/tx/' },
  testnet: { api: 'https://testnet-api.algonode.cloud', explorer: 'https://lora.algokit.io/testnet/transaction/' },
};

const network = (inline.network ?? process.env.ALGO_NETWORK ?? 'mainnet').toLowerCase();
const net = NETWORKS[network];
if (!net) {
  console.error(`ALGO_NETWORK must be "mainnet" or "testnet" (got "${network}").`);
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: npm run stamp -- <post>   (full path, or just the post name)');
  process.exit(1);
}

// Accept a full path, a bare filename, or just the slug — resolve it inside
// src/content/blog/ and add .md if missing.
const BLOG_DIR = 'src/content/blog';
const withMd = (s) => (s.endsWith('.md') ? s : `${s}.md`);
const candidates = [arg, withMd(arg), `${BLOG_DIR}/${withMd(arg)}`];
const file = candidates.find((c) => existsSync(c));
if (!file) {
  console.error(`Post not found. Tried:\n  ${candidates.join('\n  ')}`);
  process.exit(1);
}

const mnemonic = inline.mnemonic ?? process.env.ALGO_MNEMONIC;
if (!mnemonic) {
  console.error('Set ALGO_MNEMONIC in .env (copy .env.example) or on the command line.');
  process.exit(1);
}

// Hash the body only (everything after the frontmatter block).
const raw = readFileSync(file, 'utf8');
const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
const hash = createHash('sha256').update(body).digest('hex');

const acct = algosdk.mnemonicToSecretKey(mnemonic);
const algod = new algosdk.Algodv2('', net.api, '');

const suggestedParams = await algod.getTransactionParams().do();
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: acct.addr,
  receiver: acct.addr,
  amount: 0,
  note: new TextEncoder().encode(`hunch sha256:${hash}`),
  suggestedParams,
});

const { txid } = await algod.sendRawTransaction(txn.signTxn(acct.sk)).do();
const result = await algosdk.waitForConfirmation(algod, txid, 4);

// Append a new entry to the `proofs:` list in frontmatter (newest first).
// Old entries are never removed — the edit trail stays verifiable.
const today = new Date().toISOString().slice(0, 10);
const entry = `  - date: ${today}\n    hash: ${hash}\n    txn: ${txid}`;

const updated = raw.replace(/^(---\n)([\s\S]*?)(\n---\n)/, (_, open, fm, close) => {
  if (/^proofs:\s*$/m.test(fm)) {
    // insert right after the `proofs:` line so the newest stamp is first
    fm = fm.replace(/^(proofs:\s*\n)/m, `$1${entry}\n`);
  } else {
    fm = `${fm}\nproofs:\n${entry}`;
  }
  return open + fm + close;
});
writeFileSync(file, updated);

console.log(`\n✅ Stamped on Algorand ${network} (round ${result.confirmedRound})`);
console.log(`   sha256: ${hash}`);
console.log(`   txid:   ${txid}`);
console.log(`   view:   ${net.explorer}${txid}`);
console.log(`\n   Appended a proof entry to ${file}`);
if (network === 'testnet') {
  console.log(`   ⚠️  TestNet proof — re-stamp on MainNet before deploying for real.`);
}
console.log('');
