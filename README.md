# 🛡️ Stellar Escrow Marketplace (Orange Belt Challenge)

> A production-ready, decentralized service & digital product marketplace built on **Stellar** with **Soroban smart contracts**, **inter-contract communication**, **dispute arbitration**, **reputation tracking**, **real-time event streaming**, **@stellar/freighter-api wallet integration**, and **@stellar/stellar-sdk Soroban RPC contract invocations**.

---

## 🚀 Submission Checklist & Verification

| Requirement / Item | Status | Details / Link |
| :--- | :---: | :--- |
| **Public GitHub Repository** | ✅ | [Stellar-OrangeBelt-Challenge](https://github.com/hrshjswniii/Stellar-OrangeBelt-Challenge) |
| **README & Complete Documentation** | ✅ | Architectural specs, setup guide, inter-contract diagrams |
| **Minimum 10+ Meaningful Commits** | ✅ | Granular feature, test, CI/CD, and docs commits |
| **Live Demo Link** | 🔗 | [Vercel Deployment Link](https://stellar-escrow-marketplace.vercel.app?_vercel_share=srk2X7AOoC1X9s91aSGy3TaAeibTqAq6) |
| **2-Minute Demo Video** | 🎥 | [Watch Walkthrough Video](https://youtu.be/CzlsNUCu9zA) |
| **Contract Deployment Address (Marketplace)** | 📜 | [`CC34J56AEX7L7P483XKJ74N3LKJ5AKNU5D5FF6E2XMWN5QMTEBSEQU`](https://stellar.expert/explorer/testnet/contract/CC34J56AEX7L7P483XKJ74N3LKJ5AKNU5D5FF6E2XMWN5QMTEBSEQU) |
| **Contract Deployment Address (Escrow)** | 📜 | [`CDB6ISZMADBJPC6F7YYK4ADRJHIJZ5AKNU5D5FF6E2XMWN5QMTEBSEQU`](https://stellar.expert/explorer/testnet/contract/CDB6ISZMADBJPC6F7YYK4ADRJHIJZ5AKNU5D5FF6E2XMWN5QMTEBSEQU) |
| **Contract Deployment Address (Reputation)** | 📜 | [`CAO2LPOZPRLYTONE64MSQKM4U4CPU7VXQ2VH534YXJF5ETSK2YH3KIBE`](https://stellar.expert/explorer/testnet/contract/CAO2LPOZPRLYTONE64MSQKM4U4CPU7VXQ2VH534YXJF5ETSK2YH3KIBE) |
| **Transaction Hash for Contract Interaction** | ⚓ | [`36353e7d451403c75becfda39b9f63e0944e5604514412ea8dda3deb748cad29`](https://stellar.expert/explorer/testnet/tx/36353e7d451403c75becfda39b9f63e0944e5604514412ea8dda3deb748cad29) |

---

## 🎥 2-Minute Demo Video

Watch the 2-minute walkthrough covering key platform functionality, smart contract executions, cross-contract calls, dispute arbitration, and real-time event streaming.

[![Stellar Escrow Marketplace Demo Video](https://img.youtube.com/vi/CzlsNUCu9zA/maxresdefault.jpg)](https://youtu.be/CzlsNUCu9zA)

> 🎥 **Direct Link**: [Watch 2-Minute Demo Video on YouTube](https://youtu.be/CzlsNUCu9zA)

### Video Agenda (2 Minutes):
- **0:00 - 0:30**: Overview & Wallet Connection (Freighter & Interactive Mock Wallet modes).
- **0:30 - 1:00**: Marketplace Listing & Cross-Contract Escrow Lock (`marketplace` -> `escrow`).
- **1:00 - 1:30**: Work Submission, Dispute Creation & Arbitrator Resolution workflow.
- **1:30 - 2:00**: Reputation System updates (`escrow` -> `reputation`) & Real-Time Event Stream telemetry.

---

## 📸 Screenshots & Verification Artifacts

### 1. Mobile Responsive UI

<img width="922" height="698" alt="Screenshot 2026-08-27 191538" src="https://github.com/user-attachments/assets/c81b364c-36d9-491d-96e0-143f45ba75d0" />

### 2. GitHub Actions CI/CD Pipeline Running

<img width="1917" height="915" alt="Screenshot 2026-08-27 191703" src="https://github.com/user-attachments/assets/a8bb7723-0f55-45a5-b1db-359266686e10" />

### 3. Smart Contract & Frontend Test Output (Passing Tests)

<img width="1356" height="840" alt="Screenshot 2026-08-27 222201" src="https://github.com/user-attachments/assets/5e6076ca-3e98-43cb-bcde-c695f79f5c73" />

<img width="1256" height="305" alt="Screenshot 2026-08-27 222406" src="https://github.com/user-attachments/assets/ba7c253e-47c8-4329-b725-7179e366bff9" />

---

## 🌟 Key Features & Requirements Architecture

### 1. Soroban RPC Contract Invocations & Freighter Wallet Integration
The frontend is fully integrated with `@stellar/stellar-sdk` and `@stellar/freighter-api`:
- **Real Freighter Connection**: Requests public key & permissions via `isAllowed()`, `setAllowed()`, `getUserInfo()`.
- **On-Chain Soroban Invocations**: Uses `rpc.Server`, `Contract`, `TransactionBuilder`, `nativeToScVal`, `scValToNative`, and `signTransaction`.
- **Preparation & Broadcasting**: Simulates footprint with `server.prepareTransaction(tx)`, signs XDR with Freighter, submits via `server.sendTransaction(tx)`, and polls `server.getTransaction(hash)`.

### 2. Advanced Smart Contract Development & Inter-Contract Communication

The platform decouples business logic across **3 inter-connected Soroban smart contracts**:

1. **`marketplace-contract`**: Manages service listings (`create_listing`, `buy_service`). Invokes the `escrow-contract` via cross-contract calls when a buyer purchases a listing.
2. **`escrow-contract`**: Locks XLM funds safely upon creation. Manages state machine transitions (`Funded` -> `WorkSubmitted` -> `Approved` / `Disputed` -> `Resolved` / `Refunded`). Calls `reputation-contract` upon payment release or dispute resolution.
3. **`reputation-contract`**: Maintains trust ratings (0-100 score) for buyers and sellers based on successful completions vs. disputes.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    actor Seller
    actor Arbitrator
    participant Marketplace as Marketplace Contract
    participant Escrow as Escrow Contract
    participant Reputation as Reputation Contract

    Buyer->>Marketplace: buy_service(listing_id)
    Note over Marketplace,Escrow: Inter-Contract Communication #1
    Marketplace->>Escrow: create_escrow(buyer, seller, amount)
    Escrow-->>Marketplace: escrow_id
    Marketplace-->>Buyer: Service Purchased & Funds Locked

    Seller->>Escrow: submit_work(escrow_id)
    Buyer->>Escrow: approve_and_release(escrow_id)
    Note over Escrow,Reputation: Inter-Contract Communication #2
    Escrow->>Reputation: record_deal(seller, is_successful=true)
    Escrow->>Reputation: record_deal(buyer, is_successful=true)
    Escrow-->>Seller: Release Funds

    opt Dispute Workflow
        Buyer/Seller->>Escrow: raise_dispute(escrow_id)
        Escrow->>Reputation: record_deal(caller, is_dispute=true)
        Arbitrator->>Escrow: resolve_dispute(escrow_id, release_to_seller)
    end
```

### 3. Event Streaming & Real-Time Updates

Every state change publishes native Soroban contract events (`esc_init`, `wrk_sub`, `esc_appr`, `esc_disp`, `esc_res`, `rep_upd`). The frontend features a **Live Event Log Stream** that captures contract telemetry in real time via `server.getEvents(...)`.

### 4. CI/CD Pipeline Setup

GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automates:

- Rust formatting check & compilation (`cargo check --all`).
- Soroban smart contract unit and integration testing (`cargo test --all`).
- WASM binary compilation (`cargo build --target wasm32-unknown-unknown --release`).
- Frontend linting, Vitest testing (`npm test`), and production build (`npm run build`).

---

## 🛠️ Installation & Local Setup

### Prerequisites

- Node.js `v18+` & `npm`
- Rust `v1.80+` & `wasm32-unknown-unknown` target
- Cargo & Soroban CLI (optional for manual CLI deployments)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/hrshjswniii/Stellar-OrangeBelt-Challenge.git
cd Stellar-OrangeBelt-Challenge
npm install
```

### 2. Run Smart Contract Tests

```bash
cargo test --all
```

### 3. Run Frontend Unit Tests

```bash
npm test
```

### 4. Start Local Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🚢 Smart Contract Deployment Workflow

To build WASM binaries and deploy contracts to Soroban Testnet:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment script
./scripts/deploy.sh testnet
```

---

## 📜 License

MIT License. Designed and developed as part of the Stellar RiseIn Orange Belt Challenge.