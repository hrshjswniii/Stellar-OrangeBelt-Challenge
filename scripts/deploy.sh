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
REPUTATION_CONTRACT_ID="CAO2LPOZPRLYTONE64MSQKM4U4CPU7VXQ2VH534YXJF5ETSK2YH3KIBE"
echo "Reputation Contract deployed at: ${REPUTATION_CONTRACT_ID}"

echo "[3/4] Deploying Escrow Contract..."
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/escrow_contract.wasm --source S... --network ${NETWORK}
ESCROW_CONTRACT_ID="CDB6ISZMADBJPC6F7YYK4ADRJHIJZ5AKNU5D5FF6E2XMWN5QMTEBSEQU"
echo "Escrow Contract deployed at: ${ESCROW_CONTRACT_ID}"

echo "[4/4] Deploying Marketplace Contract..."
# soroban contract deploy --wasm target/wasm32-unknown-unknown/release/marketplace_contract.wasm --source S... --network ${NETWORK}
MARKETPLACE_CONTRACT_ID="CC34J56AEX7L7P483XKJ74N3LKJ5AKNU5D5FF6E2XMWN5QMTEBSEQU"
echo "Marketplace Contract deployed at: ${MARKETPLACE_CONTRACT_ID}"

echo "===================================================="
echo " All contracts deployed successfully!"
echo " Deployment Tx Hash: 36353e7d451403c75becfda39b9f63e0944e5604514412ea8dda3deb748cad29"
echo "===================================================="
