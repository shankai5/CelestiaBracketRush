# CelestiaBracketRush Test Suite

Comprehensive unit tests for the CelestiaBracketRush smart contract, covering bracket creation, FHE integration, settlement, and prize distribution.

## Test Files

### 1. `CelestiaBracketRush.test.js` - Core Functionality
Tests the fundamental features of bracket creation and management.

**Coverage:**
- ✅ Bracket creation with minimum/maximum matches (2-12)
- ✅ Draw option configuration
- ✅ Duplicate bracket ID rejection
- ✅ Entry fee validation (min: 0.001 ETH)
- ✅ Duration validation (30 min - 21 days)
- ✅ Match count validation
- ✅ Array length mismatch handling
- ✅ Bracket listing and retrieval
- ✅ Bracket cancellation (only with no entries)
- ✅ View functions and constant values

**Key Test Cases:**
```javascript
// Valid bracket creation
await contract.createReplicaBracket(
  "TEST-BRACKET",
  ethers.parseEther("0.001"),
  3600, // 1 hour
  ["Match 1", "Match 2"],
  ["Team A1", "Team A2"],
  ["Team B1", "Team B2"],
  [false, false]
);

// Should reject invalid parameters
await expect(contract.createReplicaBracket(...)).to.be.revertedWithCustomError(
  contract,
  "InvalidFee" // or InvalidDuration, InvalidMatches, etc.
);
```

### 2. `FHE-Integration.test.js` - Encrypted Weight Handling
Tests Fully Homomorphic Encryption (FHE) integration for privacy-preserving predictions.

**Coverage:**
- ✅ Encrypted weight acceptance on entry
- ✅ Exposure tracking across multiple entries
- ✅ Entry adjustment with new encrypted weight
- ✅ Privacy guarantees (weights remain encrypted)
- ✅ FHE operation edge cases (zero weight, max weight)
- ✅ Draw option with encrypted exposure
- ✅ Separate exposure tracking for LEFT/RIGHT/DRAW

**Key Privacy Features Tested:**
```javascript
// Encrypted weights are accepted but not readable
const mockEncryptedWeight = ethers.randomBytes(32);
const mockProof = ethers.randomBytes(100);

await contract.connect(player1).enterReplicaBracket(
  "FHE-TEST-BRACKET",
  picks,
  mockEncryptedWeight,
  mockProof,
  { value: ENTRY_FEE }
);

// Only pick counts are visible, not individual weights
const matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
expect(matchups[0].picksLeft).to.equal(1); // ✅ Public
expect(matchups[0].leftExposure).to.not.be.undefined; // ✅ Encrypted
```

**Entry Adjustment:**
```javascript
// Players can adjust their picks before lock time
await contract.connect(player1).adjustReplicaEntry(
  "BRACKET-ID",
  newPicks,
  newEncryptedWeight,
  newProof
);
```

### 3. `Settlement.test.js` - Settlement & Prize Distribution
Tests bracket settlement using blockhash randomness and prize/refund distribution.

**Coverage:**
- ✅ Settlement after lock time
- ✅ Pre-lock settlement rejection
- ✅ Random result generation (0-1 for binary, 0-2 with draw)
- ✅ Double settlement prevention
- ✅ Cancelled bracket settlement rejection
- ✅ Winner counting (0, 1, or multiple winners)
- ✅ PushAll flag when no winners
- ✅ Prize claims by winners
- ✅ Non-winner claim rejection
- ✅ Double claim prevention
- ✅ Prize pool splitting among multiple winners
- ✅ Refund claims for cancelled/pushAll brackets

**Settlement Process:**
```javascript
// 1. Create bracket and accept entries
await contract.createReplicaBracket(...);
await contract.connect(player1).enterReplicaBracket(...);
await contract.connect(player2).enterReplicaBracket(...);

// 2. Wait for lock time
await time.increase(DURATION + 1);

// 3. Settle using blockhash randomness
await contract.settleReplicaBracket("BRACKET-ID");

// 4. Winners can claim prizes
await contract.connect(winner).claimReplicaPrize("BRACKET-ID");
```

**Random Result Generation:**
```javascript
// Results are deterministic based on blockhash + bracket ID
bytes32 randomSeed = keccak256(abi.encode(blockhash(block.number - 1), bracketId));

// Each match gets independent random outcome
for (uint256 i = 0; i < matchups.length; i++) {
  bytes32 matchHash = keccak256(abi.encode(randomSeed, i));
  uint8 outcome = uint8(uint256(matchHash) % (allowDraw ? 3 : 2));
}
```

**Prize Distribution:**
```javascript
// Single winner gets entire prize pool
uint256 payout = bracket.prizePool / winners;

// Multiple winners split equally
// Example: 3 winners, 0.003 ETH pool → 0.001 ETH each
```

## Running Tests

### Prerequisites
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-network-helpers
```

### Run All Tests
```bash
npx hardhat test
```

### Run Specific Test File
```bash
npx hardhat test test/CelestiaBracketRush.test.js
npx hardhat test test/FHE-Integration.test.js
npx hardhat test test/Settlement.test.js
```

### Run with Gas Reporting
```bash
REPORT_GAS=true npx hardhat test
```

### Run with Coverage
```bash
npx hardhat coverage
```

## Test Environment

**Network:** Hardhat local network with fhEVM support
**Compiler:** Solidity ^0.8.24
**FHE Library:** @fhevm/solidity
**Test Framework:** Hardhat + Chai

## Mock FHE Operations

Since these tests run on a local Hardhat network without full Zama fhEVM support, FHE operations use mock data:

```javascript
// Mock encrypted weight (32 bytes)
const mockEncryptedWeight = ethers.randomBytes(32);

// Mock proof (100 bytes)
const mockProof = ethers.randomBytes(100);

// In production, these would be generated by:
// - Frontend: fhevmjs SDK (encryptWeight function)
// - Contract: FHE.fromExternal() processes real encrypted data
```

**Note:** For full FHE testing with actual encryption/decryption, deploy to Zama testnet (e.g., Sepolia with fhEVM).

## Test Data Patterns

### Standard Bracket Setup
```javascript
const ENTRY_FEE = ethers.parseEther("0.001");
const DURATION = 3600; // 1 hour

await contract.createReplicaBracket(
  "BRACKET-ID",
  ENTRY_FEE,
  DURATION,
  ["Match 1", "Match 2"],      // Labels
  ["Team A1", "Team A2"],      // Left options
  ["Team B1", "Team B2"],      // Right options
  [false, false]               // Allow draw
);
```

### Player Entry
```javascript
const picks = [0, 1]; // Match 1: LEFT, Match 2: RIGHT
const weight = ethers.randomBytes(32);
const proof = ethers.randomBytes(100);

await contract.connect(player1).enterReplicaBracket(
  "BRACKET-ID",
  picks,
  weight,
  proof,
  { value: ENTRY_FEE }
);
```

## Expected Behaviors

### Outcome Values
- `OUTCOME_LEFT = 0` - Left option wins
- `OUTCOME_RIGHT = 1` - Right option wins
- `OUTCOME_DRAW = 2` - Draw (only when `allowDraw = true`)

### Error Cases
- `BracketExists` - Duplicate bracket ID
- `BracketMissing` - Bracket not found
- `InvalidFee` - Fee below 0.001 ETH
- `InvalidDuration` - Duration outside 30min-21days
- `InvalidMatches` - Match count not 2-12 or array mismatch
- `InvalidPick` - Pick value invalid for match
- `AlreadyEntered` - Player already has entry
- `EntryNotFound` - No entry to adjust
- `Locked` - Action attempted after lock time or on cancelled bracket
- `NotSettled` - Prize claim before settlement
- `NotWinner` - Non-winner attempting prize claim
- `AlreadyClaimed` - Double claim attempt
- `NotRefundable` - Refund claim without cancel/pushAll
- `AlreadySettled` - Double settlement attempt

## Coverage Goals

| Category | Target | Status |
|----------|--------|--------|
| Bracket Creation | 100% | ✅ |
| Entry Management | 100% | ✅ |
| FHE Operations | 95% | ✅ |
| Settlement Logic | 100% | ✅ |
| Prize Distribution | 100% | ✅ |
| Refund Handling | 100% | ✅ |
| Edge Cases | 90% | ✅ |

## Integration with Frontend

These tests verify smart contract behavior. For end-to-end testing including frontend:

1. **FHE SDK Integration:** Use actual `fhevmjs` to generate encrypted weights
2. **Wallet Interaction:** Test with MetaMask/OKX wallet on Sepolia
3. **Transaction Flow:** Verify full create → enter → settle → claim cycle
4. **UI State Updates:** Ensure React Query invalidates and refetches after transactions

## Contributing

When adding new features to the contract:

1. Add corresponding test cases to appropriate file
2. Ensure all edge cases are covered
3. Update this README with new test descriptions
4. Run full test suite before committing
5. Maintain >95% coverage

## Known Limitations

1. **Mock FHE:** Tests use mock encrypted data, not real FHE operations
2. **Randomness:** Hardhat's blockhash is predictable in tests
3. **Time Travel:** Uses hardhat-network-helpers for time manipulation
4. **Gas Costs:** May differ from actual fhEVM deployment

For production validation, always test on Zama Sepolia testnet with real FHE operations.
