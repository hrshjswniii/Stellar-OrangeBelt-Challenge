import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  BASE_FEE,
} from '@stellar/stellar-sdk';

import {
  isConnected as isFreighterConnected,
  isAllowed as isFreighterAllowed,
  setAllowed as setFreighterAllowed,
  requestAccess as requestFreighterAccess,
  getUserInfo as getFreighterUserInfo,
  signTransaction as signFreighterTransaction,
} from '@stellar/freighter-api';

import { CONTRACT_ADDRESSES } from './mockData';

export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; July 2015';

export const sorobanServer = new rpc.Server(SOROBAN_RPC_URL);

export const MOCK_WALLETS = {
  buyer: {
    address: 'GCP77B3M5P7R9V1W3X5Y7Z9A2B4C6D11AA',
    short: 'GCP77B...11AA',
    role: 'Buyer',
    balance: 12500,
  },
  seller: {
    address: 'GBX42A7M5KQR9W2X8L3N4P1Q6V0Y7Z9K21',
    short: 'GBX42A...9K21',
    role: 'Seller',
    balance: 8400,
  },
  arbitrator: {
    address: 'GARB993M5P7R9V1W3X5Y7Z9A2B4C6D88DAO',
    short: 'GARB99...88DAO',
    role: 'Arbitrator DAO',
    balance: 50000,
  },
};

/**
 * Checks if the Freighter browser extension is installed
 */
export const checkFreighterInstalled = async () => {
  try {
    const connected = await isFreighterConnected();
    if (connected) return true;
  } catch (e) {
    // fallback
  }
  return typeof window !== 'undefined' && Boolean(window.freighter);
};

/**
 * Connects to real Freighter wallet, ALWAYS requesting/triggering extension authorization popup
 */
export const connectFreighterWallet = async () => {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter extension is not detected in your browser. Please install Freighter from https://www.freighter.app/');
  }

  let publicKey = null;
  try {
    // Call requestFreighterAccess to open Freighter extension authorization prompt
    publicKey = await requestFreighterAccess();
  } catch (e) {
    console.warn('requestAccess prompt warning:', e);
  }

  if (!publicKey) {
    try {
      await setFreighterAllowed();
      const userInfo = await getFreighterUserInfo();
      publicKey = userInfo?.publicKey;
    } catch (e) {
      // Fallback
    }
  }

  if (!publicKey && typeof window !== 'undefined' && window.freighter) {
    publicKey = await window.freighter.getPublicKey();
  }

  if (!publicKey) {
    throw new Error('User cancelled or denied Freighter connection request.');
  }

  return {
    connected: true,
    address: publicKey,
    shortAddress: `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
    balance: 10000,
    isMock: false,
    role: 'Freighter User',
  };
};

/**
 * Invokes a function on a deployed Soroban contract on Testnet
 */
export const invokeSorobanContract = async ({
  contractId,
  method,
  args = [],
  signerAddress,
}) => {
  if (!contractId || contractId.includes('PLACEHOLDER')) {
    throw new Error(
      `Contract ID for "${method}" is currently set to placeholder (${contractId}). Please configure a deployed contract ID to submit real on-chain transactions.`
    );
  }

  if (!signerAddress) {
    throw new Error('Signer wallet address is required to invoke Soroban contract.');
  }

  // 1. Fetch account sequence number from Soroban RPC Server
  const account = await sorobanServer.getAccount(signerAddress);
  const contract = new Contract(contractId);

  // 2. Convert JS argument types into Soroban ScVal parameters using nativeToScVal / Address
  const scValArgs = args.map((arg) => {
    if (typeof arg === 'object' && arg !== null && arg.type === 'Address') {
      return new Address(arg.value).toScVal();
    }
    if (typeof arg === 'bigint') {
      return nativeToScVal(arg, { type: 'i128' });
    }
    return nativeToScVal(arg);
  });

  // 3. Build Operation and Transaction
  const operation = contract.call(method, ...scValArgs);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // 4. Simulate transaction to calculate Soroban resource fees and footprint
  const preparedTx = await sorobanServer.prepareTransaction(tx);

  // 5. Request transaction signature from Freighter extension
  const signedXdr = await signFreighterTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // 6. Send signed XDR transaction to Soroban Testnet RPC
  const sendResp = await sorobanServer.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (sendResp.status === 'ERROR') {
    throw new Error(`Soroban transaction submission error: ${JSON.stringify(sendResp.errorResultXdr)}`);
  }

  // 7. Poll for final ledger confirmation
  let statusResp = await sorobanServer.getTransaction(sendResp.hash);
  let attempts = 0;
  while (statusResp.status === 'NOT_FOUND' && attempts < 12) {
    await new Promise((r) => setTimeout(r, 1500));
    statusResp = await sorobanServer.getTransaction(sendResp.hash);
    attempts++;
  }

  if (statusResp.status === 'SUCCESS') {
    const resultScVal = statusResp.resultMetaXdr ? statusResp.returnValue : null;
    return {
      success: true,
      hash: sendResp.hash,
      returnValue: resultScVal ? scValToNative(resultScVal) : null,
    };
  } else {
    throw new Error(`Soroban transaction failed with status: ${statusResp.status}`);
  }
};

/**
 * Polls real Soroban events for a given contract ID from Soroban RPC Server
 */
export const fetchSorobanEvents = async (contractId) => {
  try {
    if (!contractId || contractId.includes('PLACEHOLDER')) return [];
    const latestLedger = await sorobanServer.getLatestLedger();
    const startLedger = Math.max(1, latestLedger.sequence - 1000);
    const response = await sorobanServer.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit: 20,
    });

    return (response.events || []).map((evt) => ({
      timestamp: new Date().toLocaleTimeString(),
      type: evt.topic[0] ? scValToNative(evt.topic[0]) : 'CONTRACT_EVENT',
      message: `Event from contract ${contractId.slice(0, 6)}... (Ledger #${evt.ledger})`,
      color: '#38bdf8',
    }));
  } catch (err) {
    console.warn('Error fetching Soroban events from RPC:', err);
    return [];
  }
};

export const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};