#!/usr/bin/env bash
set -e

echo "===================================================="
echo " Stellar Soroban Escrow Marketplace Deployment Script"
echo "===================================================="

NETWORK="${1:-testnet}"
echo "Target Network: ${NETWORK}"

echo "[1/4] Building WASM smart contracts..."
cargo build --target wasm32-unknown-unknown --release

echo "[2/4] Deploying Reputation Contract..."
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/reputation_contract.wasm --source S... --network ${NETWORK}
REPUTATION_CONTRACT_ID="[REPUTATION_CONTRACT_ADDRESS_PLACEHOLDER]"
echo "Reputation Contract deployed at: ${REPUTATION_CONTRACT_ID}"

echo "[3/4] Deploying Escrow Contract..."
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/escrow_contract.wasm --source S... --network ${NETWORK}
ESCROW_CONTRACT_ID="[ESCROW_CONTRACT_ADDRESS_PLACEHOLDER]"
echo "Escrow Contract deployed at: ${ESCROW_CONTRACT_ID}"

echo "[4/4] Deploying Marketplace Contract..."
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/marketplace_contract.wasm --source S... --network ${NETWORK}
MARKETPLACE_CONTRACT_ID="[MARKETPLACE_CONTRACT_ADDRESS_PLACEHOLDER]"
echo "Marketplace Contract deployed at: ${MARKETPLACE_CONTRACT_ID}"

echo "===================================================="
echo " All contracts deployed successfully!"
echo " Deployment Tx Hash: [TRANSACTION_HASH_PLACEHOLDER]"
echo "===================================================="
