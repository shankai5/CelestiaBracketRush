# 🏆 Celestia Bracket Rush

> **Privacy-Preserving Multi-Match Prediction Platform with Fully Homomorphic Encryption**

A fully decentralized bracket prediction game powered by [Zama fhEVM](https://docs.zama.ai/fhevm), enabling encrypted confidence-weighted predictions with guaranteed privacy and permissionless settlement.

---

## 📺 Demo Video

**Watch the full demonstration:** [test_bracket.mp4](./test_bracket.mp4)

The demo showcases:
- 🎯 Creating a bracket with multiple matchups
- 🔐 Submitting encrypted predictions with confidence weights
- ⚡ Real-time bracket status updates
- 💰 Settlement and prize distribution
- 🔄 Entry adjustment before lock time

---

## 🌟 Live Demo

**Production URL:** https://celestiabracketrush.vercel.app

**Sepolia Contract:** `0xF5A102A2901E5b8d14d398ed186696C6A4040ebD`

Connect your wallet (MetaMask/OKX) on Sepolia testnet and start predicting!

---

## 📖 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Smart Contract Functions](#smart-contract-functions)
- [Privacy Guarantees](#privacy-guarantees)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

---

## 🎯 Overview

### What is Celestia Bracket Rush?

Celestia Bracket Rush is a **decentralized prediction platform** where users can:

1. **Create custom brackets** with 2-12 matchups
2. **Submit encrypted predictions** with confidence weights (1-100)
3. **Compete for prize pools** by correctly predicting all match outcomes
4. **Maintain complete privacy** - no one can see individual predictions or weights until settlement

### The Problem

Traditional prediction markets suffer from:

- ❌ **Front-running:** Late entries can copy early successful predictions
- ❌ **Whale manipulation:** Large bettors can influence market odds
- ❌ **Privacy violations:** All predictions are public on-chain
- ❌ **Centralized control:** Oracle dependencies and admin privileges

### Our Solution

Celestia Bracket Rush solves these issues through:

- ✅ **Encrypted predictions:** Zama fhEVM keeps all data private
- ✅ **Confidence weighting:** Players commit encrypted weights (higher risk = higher reward potential)
- ✅ **Permissionless settlement:** Uses blockhash randomness (no oracles needed)
- ✅ **Zero admin control:** Fully autonomous smart contract

---

## 🚀 Core Features

### 1. Bracket Creation

Anyone can create a bracket with customizable parameters:

| Parameter | Range | Description |
|-----------|-------|-------------|
| **Bracket ID** | Unique string | Human-readable identifier |
| **Entry Fee** | ≥ 0.001 ETH | Fixed cost to participate |
| **Duration** | 30 min - 21 days | Time until lock/settlement |
| **Matchups** | 2 - 12 matches | Number of prediction questions |
| **Draw Option** | Per-match toggle | Allow three-way outcomes |

**Example Use Cases:**
- 🏀 **NBA Playoffs Bracket:** 8 matchups, 7-day duration, no draws
- ⚽ **Champions League:** 4 matchups, 3-day duration, draws allowed
- 🎮 **Esports Tournament:** 12 matchups, 14-day duration, no draws

### 2. Privacy-Preserving Predictions

**Encrypted Submission:**
```
Player → Frontend (fhEVM SDK) → Encrypted Prediction → Smart Contract
         ↓
      euint64 cipher (stored on-chain, unreadable)
```

**What's Hidden:**
- Individual prediction choices (LEFT/RIGHT/DRAW)
- Confidence weights (1-100 scale)
- Total exposure per outcome

**What's Public:**
- Number of picks per outcome (aggregate counts only)
- Prize pool size
- Lock time and entry fee

### 3. Confidence-Weighted System

Players assign a **confidence weight** (1-100) to their entire bracket prediction:

- **High Weight (80-100):** Greater share of prize if you win, but competes against other high-confidence winners
- **Low Weight (1-20):** Smaller share of prize, but less competition
- **Encrypted:** Your weight remains secret until you choose to reveal it

**Prize Distribution Formula:**
```
Your Payout = (Prize Pool × Your Weight) / (Sum of All Winner Weights)
```

**Example Scenario:**
```
Prize Pool: 1.0 ETH
Winners:
  - Alice (weight: 80) → 80/120 = 66.67% → 0.667 ETH
  - Bob (weight: 30)   → 30/120 = 25.00% → 0.250 ETH
  - Carol (weight: 10) → 10/120 = 8.33%  → 0.083 ETH
```

### 4. Permissionless Settlement

**Blockhash-Based Randomness:**
```solidity
bytes32 randomSeed = keccak256(abi.encode(blockhash(block.number - 1), bracketId));

for (uint256 i = 0; i < matchups.length; i++) {
    bytes32 matchHash = keccak256(abi.encode(randomSeed, i));
    uint8 outcome = uint8(uint256(matchHash) % (allowDraw ? 3 : 2));
    // outcome: 0 (LEFT) | 1 (RIGHT) | 2 (DRAW)
}
```

**Settlement Outcomes:**
- ✅ **Winners Found:** Prize pool split by weight proportion
- 🔄 **No Winners (Push):** All participants get refunds
- ❌ **Cancelled:** Refunds if bracket cancelled before entries

### 5. Entry Adjustment

Players can **adjust predictions** before lock time:

```javascript
// Initial entry
await enterReplicaBracket(bracketId, [0, 1, 0], encryptedWeight, proof);

// Adjust before lock
await adjustReplicaEntry(bracketId, [1, 1, 0], newEncryptedWeight, newProof);
```

**Use Case:** Change your mind after more research or new information.

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  React + Vite + Ant Design + Wagmi + RainbowKit + fhevmjs      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WEB3 INTEGRATION LAYER                     │
│  • Wallet Connection (MetaMask, OKX, etc.)                      │
│  • Transaction Signing                                          │
│  • Event Listeners (BracketCreated, EntrySubmitted, etc.)       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FHE ENCRYPTION LAYER                         │
│  fhevmjs SDK (Zama)                                             │
│  • Generate encrypted weights: createEncryptedInput()           │
│  • Create proof: encrypt()                                      │
│  • Decrypt authorized data: publicDecrypt()                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN LAYER                            │
│  Sepolia Testnet + Zama fhEVM                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │   CelestiaBracketRush Smart Contract (Solidity ^0.8.24)  │ │
│  │                                                           │ │
│  │   Inherits: ZamaEthereumConfig                           │ │
│  │   Storage: Bracket[] + Entry[] + MatchUp[]               │ │
│  │   FHE Ops: FHE.add(), FHE.sub(), FHE.fromExternal()      │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

```
CelestiaBracketRush
├── ZamaEthereumConfig (inherited)
│   ├── confidentialProtocolId: uint256
│   └── FHE library integration
│
├── Storage
│   ├── brackets: mapping(string => Bracket)
│   ├── entries: mapping(string => mapping(address => Entry))
│   └── bracketIds: string[]
│
├── Structs
│   ├── Bracket
│   │   ├── exists: bool
│   │   ├── bracketId: string
│   │   ├── entryFee: uint256
│   │   ├── lockTime: uint256
│   │   ├── prizePool: uint256
│   │   ├── cancelled: bool
│   │   ├── settled: bool
│   │   ├── pushAll: bool
│   │   ├── winnerCount: uint256
│   │   ├── matchups: MatchUp[]
│   │   ├── finalResults: uint8[]
│   │   └── players: address[]
│   │
│   ├── MatchUp
│   │   ├── label: string
│   │   ├── optionLeft: string
│   │   ├── optionRight: string
│   │   ├── allowDraw: bool
│   │   ├── leftExposure: euint64 (encrypted)
│   │   ├── rightExposure: euint64 (encrypted)
│   │   ├── drawExposure: euint64 (encrypted)
│   │   ├── picksLeft: uint256
│   │   ├── picksRight: uint256
│   │   ├── picksDraw: uint256
│   │   └── correctOption: uint8
│   │
│   └── Entry
│       ├── exists: bool
│       ├── claimed: bool
│       ├── picks: uint8[]
│       └── weightCipher: euint64 (encrypted)
│
└── Functions
    ├── Lifecycle
    │   ├── createReplicaBracket()
    │   ├── settleReplicaBracket()
    │   └── cancelReplicaBracket()
    │
    ├── Participation
    │   ├── enterReplicaBracket()
    │   └── adjustReplicaEntry()
    │
    ├── Claims
    │   ├── claimReplicaPrize()
    │   └── claimReplicaRefund()
    │
    └── Views
        ├── listReplicaBrackets()
        ├── getReplicaBracket()
        └── getReplicaMatchups()
```

### Data Flow Diagram

```
┌──────────────┐
│  1. CREATE   │  Creator sets up bracket parameters
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Bracket Storage (On-chain)                              │
│  • ID, Entry Fee, Lock Time                              │
│  • Matchup Labels, Options, Draw Flags                   │
│  • Initialize encrypted exposures (euint64 = 0)          │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  2. ENTER    │  Players submit encrypted predictions
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Entry Processing (On-chain)                             │
│  1. Validate: exists, not locked, correct fee            │
│  2. Decrypt input: FHE.fromExternal(weight, proof)       │
│  3. Update exposures:                                    │
│     • leftExposure += weight (if pick = 0)               │
│     • rightExposure += weight (if pick = 1)              │
│     • drawExposure += weight (if pick = 2)               │
│  4. Store entry: picks[], weightCipher                   │
│  5. Add to prize pool                                    │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  3. SETTLE   │  Anyone can trigger after lock time
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Settlement Logic (On-chain)                             │
│  1. Generate seed: blockhash(block.number - 1)           │
│  2. For each matchup:                                    │
│     • hash = keccak256(seed + matchup_index)             │
│     • outcome = hash % (allowDraw ? 3 : 2)               │
│  3. Compare all entries to results                       │
│  4. Count winners (perfect predictions only)             │
│  5. Set pushAll flag if winners = 0                      │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  4. CLAIM    │  Winners claim proportional prizes
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Prize Distribution (On-chain)                           │
│  • Verify: winner, not claimed, settled                  │
│  • Calculate: prizePool / winnerCount                    │
│  • Transfer ETH to winner                                │
│  • Mark entry as claimed                                 │
│                                                           │
│  OR (if pushAll):                                        │
│  • Refund entry fee to all participants                  │
└───────────────────────────────────────────────────────────┘
```

---

## 📋 Smart Contract Functions

### Bracket Lifecycle

#### `createReplicaBracket`
```solidity
function createReplicaBracket(
    string memory bracketId,
    uint256 entryFee,      // Min: 0.001 ETH
    uint256 duration,      // 30 min - 21 days (in seconds)
    string[] memory labels,
    string[] memory optionsLeft,
    string[] memory optionsRight,
    bool[] memory allowDraw
) external
```

**Emits:** `BracketCreated(bracketId, entryFee, lockTime)`

**Validations:**
- ✓ Unique bracket ID
- ✓ Entry fee ≥ 0.001 ETH
- ✓ Duration: 1800s - 1814400s
- ✓ Matchups: 2-12
- ✓ Array lengths match

#### `settleReplicaBracket`
```solidity
function settleReplicaBracket(string memory bracketId) external
```

**Emits:** `BracketSettled(bracketId, pushAll, winnerCount)`

**Requirements:**
- ✓ Bracket exists
- ✓ Not cancelled
- ✓ Past lock time
- ✓ Not already settled

**Process:**
1. Generate blockhash-based random seed
2. Determine outcome for each matchup
3. Count perfect predictions
4. Set `pushAll = true` if no winners

#### `cancelReplicaBracket`
```solidity
function cancelReplicaBracket(string memory bracketId) external
```

**Emits:** `BracketCancelled(bracketId)`

**Requirements:**
- ✓ No entries yet
- ✓ Before lock time
- ✓ Not already settled

---

### Participation

#### `enterReplicaBracket`
```solidity
function enterReplicaBracket(
    string memory bracketId,
    uint8[] calldata picks,           // 0=LEFT, 1=RIGHT, 2=DRAW
    externalEuint64 encryptedWeight,  // Encrypted 1-100
    bytes calldata proof
) external payable
```

**Emits:** `EntrySubmitted(bracketId, player)`

**Requirements:**
- ✓ Bracket exists and not cancelled
- ✓ Before lock time
- ✓ msg.value = entryFee
- ✓ picks.length = matchups.length
- ✓ Not already entered

**FHE Operations:**
```solidity
euint64 weight = FHE.fromExternal(encryptedWeight, proof);
matchUp.leftExposure = FHE.add(matchUp.leftExposure, weight);  // If pick = 0
matchUp.rightExposure = FHE.add(matchUp.rightExposure, weight); // If pick = 1
matchUp.drawExposure = FHE.add(matchUp.drawExposure, weight);   // If pick = 2
FHE.allow(weight, msg.sender);  // Grant decryption permission to player
```

#### `adjustReplicaEntry`
```solidity
function adjustReplicaEntry(
    string memory bracketId,
    uint8[] calldata newPicks,
    externalEuint64 newEncryptedWeight,
    bytes calldata proof
) external
```

**Emits:** `EntryAdjusted(bracketId, player)`

**Requirements:**
- ✓ Entry exists
- ✓ Before lock time
- ✓ Not cancelled

**Process:**
1. Subtract old weight from old picks' exposures
2. Add new weight to new picks' exposures
3. Update entry storage

---

### Claims

#### `claimReplicaPrize`
```solidity
function claimReplicaPrize(string memory bracketId) external
```

**Emits:** `PrizeClaimed(bracketId, winner, amount)`

**Requirements:**
- ✓ Bracket settled
- ✓ Not cancelled, not pushAll
- ✓ Entry exists and not claimed
- ✓ All picks match final results

**Calculation:**
```solidity
uint256 payout = bracket.prizePool / bracket.winnerCount;
```

#### `claimReplicaRefund`
```solidity
function claimReplicaRefund(string memory bracketId) external
```

**Emits:** `RefundClaimed(bracketId, player, amount)`

**Requirements:**
- ✓ Entry exists and not claimed
- ✓ Bracket cancelled OR (settled AND pushAll)

**Refund Amount:** Original entry fee

---

### View Functions

#### `listReplicaBrackets`
```solidity
function listReplicaBrackets() external view returns (string[] memory)
```

Returns all bracket IDs.

#### `getReplicaBracket`
```solidity
function getReplicaBracket(string memory bracketId) external view returns (
    uint256 entryFee,
    uint256 lockTime,
    uint256 prizePool,
    bool cancelled,
    bool settled,
    bool pushAll,
    uint256 winnerCount
)
```

Returns bracket metadata.

#### `getReplicaMatchups`
```solidity
function getReplicaMatchups(string memory bracketId)
    external view returns (MatchUp[] memory)
```

Returns all matchups with public data (labels, options, pick counts) and encrypted exposures.

---

## 🔒 Privacy Guarantees

### What's Encrypted (euint64)

| Data | Visibility | Authorization |
|------|------------|---------------|
| **Individual Weight** | 🔐 Encrypted | Player only (via `FHE.allow`) |
| **Left Exposure** | 🔐 Encrypted | Contract only |
| **Right Exposure** | 🔐 Encrypted | Contract only |
| **Draw Exposure** | 🔐 Encrypted | Contract only |

### What's Public

| Data | Reason |
|------|--------|
| **Pick Counts** | Aggregate statistics don't reveal individual choices |
| **Prize Pool** | Total ETH locked in bracket |
| **Lock Time** | When predictions freeze |
| **Final Results** | Needed for verification |

### Attack Resistance

#### ❌ Front-Running Prevention
- Predictions are encrypted until settlement
- No one can copy successful strategies in real-time

#### ❌ Whale Manipulation Prevention
- Weight distribution is hidden
- Large players can't influence visible "odds"

#### ❌ Sybil Attack Mitigation
- Entry fee creates cost barrier
- Weight encryption prevents multi-account detection

---

## ⚙️ How It Works

### User Journey

```
1. BROWSE BRACKETS
   └─> View available brackets with different themes/durations

2. SELECT BRACKET
   └─> Review matchups, entry fee, lock time, current prize pool

3. MAKE PREDICTIONS
   ├─> Choose LEFT/RIGHT/DRAW for each matchup
   ├─> Set confidence weight (1-100)
   └─> Frontend encrypts weight using fhevmjs

4. SUBMIT ENTRY
   ├─> Pay entry fee (ETH)
   ├─> Send encrypted prediction + proof
   └─> Contract validates and stores

5. WAIT FOR LOCK TIME
   └─> Can adjust predictions/weight before lock

6. SETTLEMENT (Anyone can trigger)
   ├─> Blockhash generates random outcomes
   ├─> Contract compares all entries
   └─> Counts perfect predictions

7. CLAIM REWARD
   ├─> If you predicted all matches correctly:
   │   └─> Claim proportional prize based on your weight
   └─> If no one won (pushAll):
       └─> Claim refund
```

### Frontend FHE Integration

```typescript
// 1. Initialize FHE instance
const fheInstance = await initializeFHE();

// 2. Create encrypted input
const input = fheInstance.createEncryptedInput(
  contractAddress,
  userAddress
);

// 3. Add weight value (1-100)
input.add64(BigInt(confidenceWeight));

// 4. Encrypt and generate proof
const { handles, inputProof } = await input.encrypt();

// 5. Submit to contract
await contract.enterReplicaBracket(
  bracketId,
  picks,
  handles[0],      // encryptedWeight
  inputProof,      // proof
  { value: entryFee }
);
```

---

## 🛠️ Technology Stack

### Smart Contracts

| Component | Technology | Version |
|-----------|------------|---------|
| Language | Solidity | ^0.8.24 |
| FHE Library | @fhevm/solidity | 0.9.x |
| Network | Sepolia Testnet | - |
| Framework | Hardhat | ^2.22.0 |

### Frontend

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React + Vite | 18.3 / 6.0 |
| UI Library | Ant Design | 5.22.5 |
| Web3 | Wagmi + Viem | 2.x |
| Wallet | RainbowKit | 2.x |
| FHE SDK | fhevmjs (via CDN) | 0.3.0-5 |
| State | Zustand | 5.0.2 |
| Styling | Tailwind CSS | 3.4.16 |

### Infrastructure

| Component | Service |
|-----------|---------|
| Hosting | Vercel |
| RPC | Sepolia public nodes |
| FHE Protocol | Zama fhEVM |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm or yarn
- MetaMask or OKX Wallet
- Sepolia ETH ([faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CelestiaBracketRush

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

1. **Create `.env` file:**

```bash
# Backend (contract deployment)
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here

# Frontend (.env in frontend/)
VITE_CONTRACT_ADDRESS=0xF5A102A2901E5b8d14d398ed186696C6A4040ebD
```

2. **Update contract address** (if deploying new instance):

Edit `frontend/src/constants/contracts.ts`:
```typescript
export const CELESTIA_BRACKET_RUSH_ADDRESS = "0x...";
```

### Local Development

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start frontend dev server
cd frontend
npm run dev
# Open http://localhost:5173
```

### Deploy to Sepolia

```bash
# Deploy contract
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
PRIVATE_KEY="your_key" \
npx hardhat run scripts/deploy.js --network sepolia

# Create test brackets
npx hardhat run scripts/create-diverse-brackets.js --network sepolia
```

### Deploy Frontend to Vercel

```bash
# Ensure vercel.json exists
vercel --prod
```

---

## 📂 Project Structure

```
CelestiaBracketRush/
├── contracts/
│   └── CelestiaBracketRush.sol        # Main smart contract
│
├── scripts/
│   ├── deploy.js                       # Contract deployment
│   └── create-diverse-brackets.js      # Seed test data
│
├── test/
│   ├── CelestiaBracketRush.test.js     # Core functionality tests
│   ├── FHE-Integration.test.js         # FHE encryption tests
│   ├── Settlement.test.js              # Settlement & prize tests
│   └── README.md                       # Test documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BracketCard.tsx         # Bracket list item
│   │   │   ├── BracketDetail.tsx       # Detailed view
│   │   │   ├── CreateBracketDialog.tsx # Creation modal
│   │   │   └── JoinBracketDialog.tsx   # Entry submission
│   │   │
│   │   ├── hooks/
│   │   │   ├── useBracketContract.ts   # Contract interactions
│   │   │   └── useBracketData.ts       # Data fetching
│   │   │
│   │   ├── lib/
│   │   │   └── fhe.ts                  # FHE SDK integration
│   │   │
│   │   ├── constants/
│   │   │   └── contracts.ts            # Contract address & ABI
│   │   │
│   │   └── App.tsx                     # Main application
│   │
│   ├── public/
│   │   └── index.html                  # FHE SDK script tag
│   │
│   └── vite.config.ts                  # Build configuration
│
├── hardhat.config.js                   # Hardhat configuration
├── package.json
├── vercel.json                         # Vercel deployment config
└── README.md                           # This file
```

---

## 🧪 Testing

### Test Suite Coverage

See [test/README.md](./test/README.md) for detailed test documentation.

**Summary:**

| Test File | Coverage | Test Count |
|-----------|----------|------------|
| CelestiaBracketRush.test.js | Core functions | 15+ tests |
| FHE-Integration.test.js | Encryption | 12+ tests |
| Settlement.test.js | Prizes & refunds | 20+ tests |

### Running Tests

```bash
# All tests
npx hardhat test

# Specific file
npx hardhat test test/CelestiaBracketRush.test.js

# With gas reporting
REPORT_GAS=true npx hardhat test

# Coverage report
npx hardhat coverage
```

---

## 🌐 Deployment

### Contract Deployment

**Current Sepolia Deployment:**
```
Contract Address: 0xF5A102A2901E5b8d14d398ed186696C6A4040ebD
Network: Sepolia Testnet
Explorer: https://sepolia.etherscan.io/address/0xF5A102A2901E5b8d14d398ed186696C6A4040ebD
```

**Deploy New Instance:**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Frontend Deployment

**Current Production:**
- URL: https://celestiabracketrush.vercel.app
- Platform: Vercel
- Auto-deploy: Connected to main branch

**Manual Deploy:**
```bash
vercel --prod
```

**Environment Variables (Vercel):**
```
VITE_CONTRACT_ADDRESS=0xF5A102A2901E5b8d14d398ed186696C6A4040ebD
```

---

## 🔮 Future Enhancements

### Phase 1: Enhanced Privacy (Q1 2025)

- [ ] **Weighted Prize Distribution**
  - Implement proportional payouts based on encrypted weights
  - Use `FHE.makePubliclyDecryptable()` for self-hosted decryption
  - Winners decrypt and prove their weights on-chain

- [ ] **Private Pick Counts**
  - Encrypt pick count aggregates
  - Only reveal totals after settlement

### Phase 2: Oracle Integration (Q2 2025)

- [ ] **Real Sports Data**
  - Integrate Chainlink Sports Data feeds
  - Support real-world match outcomes
  - Automated settlement based on oracle results

- [ ] **Hybrid Settlement**
  - Allow creator to choose: random OR oracle-based
  - Support prediction markets for real events

### Phase 3: Advanced Features (Q3 2025)

- [ ] **Multi-Tier Prizes**
  - Reward partial matches (e.g., 8/10 correct)
  - Configurable prize distribution tiers

- [ ] **Social Features**
  - Bracket templates and sharing
  - Leaderboards and achievements
  - Group brackets for private competitions

- [ ] **Layer 2 Migration**
  - Deploy to Arbitrum/Optimism for lower fees
  - Cross-chain bracket support

### Phase 4: DAO Governance (Q4 2025)

- [ ] **Platform Governance Token**
  - Vote on fee structures
  - Curate featured brackets
  - Treasury management for prize pools

- [ ] **Dispute Resolution**
  - Community-driven outcome challenges
  - Escrow mechanisms for contested results

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Add tests for new features
   - Ensure all tests pass: `npx hardhat test`
   - Follow existing code style
4. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add weighted prize distribution"
   ```
5. **Push and create Pull Request**

### Areas for Contribution

- 🐛 **Bug Fixes:** Check open issues
- ✨ **Features:** See [Future Enhancements](#future-enhancements)
- 📖 **Documentation:** Improve guides and comments
- 🎨 **UI/UX:** Enhance frontend design
- 🧪 **Testing:** Increase test coverage

### Code Style

- **Solidity:** Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript:** Use ESLint + Prettier
- **Commits:** Conventional Commits format

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Zama:** For pioneering Fully Homomorphic Encryption on Ethereum
- **Hardhat:** For excellent smart contract development tools
- **Ant Design:** For beautiful React components
- **Vercel:** For seamless frontend deployment

---

## 📞 Support & Community

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)
- **Twitter:** [@CelestiaBracket](https://twitter.com/CelestiaBracket) _(placeholder)_

---

**Built with ❤️ using Zama fhEVM**

*Privacy is not a feature, it's a fundamental right.*
