import { Keypair, rpc, Operation, TransactionBuilder, Networks, Address, StrKey } from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const PASSPHRASE = Networks.TESTNET;
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

async function queryJsonRpc(method, params) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`RPC Error: ${JSON.stringify(data.error)}`);
  }
  return data.result;
}

async function main() {
  console.log('🚀 Starting Stellar Soroban Testnet Contract Deployment...');

  const server = new rpc.Server(RPC_URL);

  // 1. Generate & fund deployer keypair
  const keypair = Keypair.random();
  console.log(`🔑 Deployer Public Key: ${keypair.publicKey()}`);

  console.log('💰 Requesting Testnet XLM from Friendbot...');
  const friendbotRes = await fetch(`${FRIENDBOT_URL}?addr=${keypair.publicKey()}`);
  if (!friendbotRes.ok) {
    throw new Error(`Friendbot funding failed: ${await friendbotRes.text()}`);
  }
  console.log('✅ Account funded successfully!');

  // Helper to load account and submit tx via JSON-RPC poll
  async function submitTx(builderFn) {
    const account = await server.getAccount(keypair.publicKey());
    const tx = builderFn(account);
    const prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);
    const sendRes = await server.sendTransaction(prepared);
    console.log(`📡 Submitted Tx Status: ${sendRes.status}, Hash: ${sendRes.hash}`);

    if (sendRes.status === 'PENDING' || sendRes.status === 'SUCCESS') {
      let statusRes = await queryJsonRpc('getTransaction', { hash: sendRes.hash });
      while (statusRes.status === 'NOT_FOUND' || statusRes.status === 'PENDING') {
        await new Promise(r => setTimeout(r, 2000));
        statusRes = await queryJsonRpc('getTransaction', { hash: sendRes.hash });
      }
      if (statusRes.status === 'SUCCESS') {
        return { hash: sendRes.hash, result: statusRes };
      } else {
        throw new Error(`Transaction failed with status ${statusRes.status}`);
      }
    } else {
      throw new Error(`Send transaction failed: ${JSON.stringify(sendRes)}`);
    }
  }

  // Paths to WASM files
  const wasmDir = path.join(process.cwd(), 'target', 'wasm32-unknown-unknown', 'release');
  const contracts = ['reputation_contract', 'escrow_contract', 'marketplace_contract'];
  const deployedContracts = {};
  let primaryTxHash = '';

  for (const name of contracts) {
    const wasmPath = path.join(wasmDir, `${name}.wasm`);
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file not found at ${wasmPath}. Run cargo build first.`);
    }

    console.log(`\n📦 Uploading WASM for ${name}...`);
    const wasmBuffer = fs.readFileSync(wasmPath);
    
    // Upload WASM
    const uploadRes = await submitTx(account => 
      new TransactionBuilder(account, { fee: '100000', networkPassphrase: PASSPHRASE })
        .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
        .setTimeout(60)
        .build()
    );
    
    console.log(`✅ WASM Upload Tx Hash: ${uploadRes.hash}`);
    if (!primaryTxHash) primaryTxHash = uploadRes.hash;

    const wasmHashBuffer = crypto.createHash('sha256').update(wasmBuffer).digest();
    const wasmHashHex = wasmHashBuffer.toString('hex');
    const salt = crypto.randomBytes(32);

    console.log(`🔧 Creating Contract Instance for ${name}...`);
    const createRes = await submitTx(account =>
      new TransactionBuilder(account, { fee: '100000', networkPassphrase: PASSPHRASE })
        .addOperation(Operation.createCustomContract({
          address: new Address(keypair.publicKey()),
          wasmHash: wasmHashBuffer,
          salt: salt
        }))
        .setTimeout(60)
        .build()
    );

    // Compute standard Soroban Contract Address from WASM Hash + Salt
    const contractPreimageHash = crypto.createHash('sha256').update(Buffer.concat([wasmHashBuffer, salt])).digest();
    const contractAddress = StrKey.encodeContract(contractPreimageHash);
    console.log(`🎉 Deployed ${name} Address: ${contractAddress}`);
    console.log(`✅ Contract Instance Tx Hash: ${createRes.hash}`);

    deployedContracts[name] = {
      address: contractAddress,
      uploadTxHash: uploadRes.hash,
      createTxHash: createRes.hash
    };
  }

  console.log('\n====================================================');
  console.log('SUMMARY OF STELLAR TESTNET DEPLOYMENT');
  console.log('====================================================');
  console.log('Reputation Contract :', deployedContracts['reputation_contract'].address);
  console.log('Escrow Contract     :', deployedContracts['escrow_contract'].address);
  console.log('Marketplace Contract:', deployedContracts['marketplace_contract'].address);
  console.log('Primary Tx Hash     :', primaryTxHash);
  console.log('====================================================\n');

  // Save deployment info
  const outputInfo = {
    network: 'testnet',
    deployer: keypair.publicKey(),
    primaryTxHash: primaryTxHash,
    contracts: deployedContracts,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(process.cwd(), 'deployment-info.json'), JSON.stringify(outputInfo, null, 2));
  console.log('Saved deployment metadata to deployment-info.json');
}

main().catch(err => {
  console.error('❌ Deployment error:', err);
  process.exit(1);
});
