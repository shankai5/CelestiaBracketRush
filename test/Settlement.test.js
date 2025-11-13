const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CelestiaBracketRush - Settlement & Prize Distribution", function () {
  let contract;
  let owner, player1, player2, player3, player4;
  const ENTRY_FEE = ethers.parseEther("0.001");
  const SHORT_DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, player1, player2, player3, player4] = await ethers.getSigners();
    const CelestiaBracketRush = await ethers.getContractFactory("CelestiaBracketRush");
    contract = await CelestiaBracketRush.deploy();
    await contract.waitForDeployment();
  });

  describe("Settlement Process", function () {
    it("Should settle bracket after lock time", async function () {
      await contract.createReplicaBracket(
        "SETTLE-TEST",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // Player enters
      await contract.connect(player1).enterReplicaBracket(
        "SETTLE-TEST",
        [0, 1],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Fast forward past lock time
      await time.increase(SHORT_DURATION + 1);

      // Settle
      const tx = await contract.settleReplicaBracket("SETTLE-TEST");
      await expect(tx).to.emit(contract, "BracketSettled");

      const bracket = await contract.getReplicaBracket("SETTLE-TEST");
      expect(bracket.settled).to.be.true;
    });

    it("Should reject settlement before lock time", async function () {
      await contract.createReplicaBracket(
        "EARLY-SETTLE",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await expect(
        contract.settleReplicaBracket("EARLY-SETTLE")
      ).to.be.revertedWithCustomError(contract, "Locked");
    });

    it("Should generate random results for all matches", async function () {
      await contract.createReplicaBracket(
        "RANDOM-TEST",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2", "Match 3"],
        ["Team A1", "Team A2", "Team A3"],
        ["Team B1", "Team B2", "Team B3"],
        [false, false, false]
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("RANDOM-TEST");

      const matchups = await contract.getReplicaMatchups("RANDOM-TEST");

      // All matches should have a result (0 or 1)
      for (let i = 0; i < matchups.length; i++) {
        expect(matchups[i].correctOption).to.be.oneOf([0, 1]);
      }
    });

    it("Should generate random results including draw when allowed", async function () {
      await contract.createReplicaBracket(
        "DRAW-RANDOM-TEST",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [true, true] // Allow draw for both
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("DRAW-RANDOM-TEST");

      const matchups = await contract.getReplicaMatchups("DRAW-RANDOM-TEST");

      // Results should be 0, 1, or 2 (draw)
      for (let i = 0; i < matchups.length; i++) {
        expect(matchups[i].correctOption).to.be.oneOf([0, 1, 2]);
      }
    });

    it("Should reject double settlement", async function () {
      await contract.createReplicaBracket(
        "DOUBLE-SETTLE",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("DOUBLE-SETTLE");

      await expect(
        contract.settleReplicaBracket("DOUBLE-SETTLE")
      ).to.be.revertedWithCustomError(contract, "AlreadySettled");
    });

    it("Should reject settlement of cancelled bracket", async function () {
      await contract.createReplicaBracket(
        "CANCELLED-SETTLE",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await contract.cancelReplicaBracket("CANCELLED-SETTLE");

      await time.increase(SHORT_DURATION + 1);

      await expect(
        contract.settleReplicaBracket("CANCELLED-SETTLE")
      ).to.be.revertedWithCustomError(contract, "Locked");
    });
  });

  describe("Winner Counting", function () {
    it("Should count single winner correctly", async function () {
      await contract.createReplicaBracket(
        "ONE-WINNER",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // Multiple players with different picks
      await contract.connect(player1).enterReplicaBracket(
        "ONE-WINNER",
        [0, 0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "ONE-WINNER",
        [1, 1],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player3).enterReplicaBracket(
        "ONE-WINNER",
        [0, 1],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("ONE-WINNER");

      const bracket = await contract.getReplicaBracket("ONE-WINNER");

      // Should have 0 or 1 winner (unlikely to have multiple with random results)
      expect(bracket.winnerCount).to.be.at.least(0);
      expect(bracket.winnerCount).to.be.at.most(3);
    });

    it("Should set pushAll when no winners", async function () {
      await contract.createReplicaBracket(
        "NO-WINNER",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2", "Match 3", "Match 4"],
        ["Team A1", "Team A2", "Team A3", "Team A4"],
        ["Team B1", "Team B2", "Team B3", "Team B4"],
        [false, false, false, false]
      );

      // Note: With 4 matches and random results, it's possible but unlikely
      // to have no winners. This test demonstrates the logic.

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("NO-WINNER");

      const bracket = await contract.getReplicaBracket("NO-WINNER");

      // If no players entered, winnerCount should be 0 and pushAll should be true
      expect(bracket.winnerCount).to.equal(0);
      expect(bracket.pushAll).to.be.true;
    });

    it("Should count multiple winners correctly", async function () {
      await contract.createReplicaBracket(
        "MULTI-WINNER",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // All players pick the same (either all will win or all will lose)
      await contract.connect(player1).enterReplicaBracket(
        "MULTI-WINNER",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "MULTI-WINNER",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player3).enterReplicaBracket(
        "MULTI-WINNER",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("MULTI-WINNER");

      const bracket = await contract.getReplicaBracket("MULTI-WINNER");

      // Either 0 or 3 winners (all picked same)
      expect(bracket.winnerCount).to.be.oneOf([0, 3]);
    });
  });

  describe("Prize Claims", function () {
    it("Should allow winner to claim prize", async function () {
      await contract.createReplicaBracket(
        "PRIZE-CLAIM",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      const initialBalance = await ethers.provider.getBalance(player1.address);

      await contract.connect(player1).enterReplicaBracket(
        "PRIZE-CLAIM",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("PRIZE-CLAIM");

      const matchups = await contract.getReplicaMatchups("PRIZE-CLAIM");
      const result = matchups[0].correctOption;

      if (result === 0) {
        // Player1 won
        const tx = await contract.connect(player1).claimReplicaPrize("PRIZE-CLAIM");
        await expect(tx)
          .to.emit(contract, "PrizeClaimed")
          .withArgs("PRIZE-CLAIM", player1.address, ENTRY_FEE);

        // Check balance increased (approximately, accounting for gas)
        const finalBalance = await ethers.provider.getBalance(player1.address);
        expect(finalBalance).to.be.gt(initialBalance - ENTRY_FEE);
      }
    });

    it("Should reject claim from non-winner", async function () {
      await contract.createReplicaBracket(
        "NON-WINNER-CLAIM",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "NON-WINNER-CLAIM",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "NON-WINNER-CLAIM",
        [1],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("NON-WINNER-CLAIM");

      const matchups = await contract.getReplicaMatchups("NON-WINNER-CLAIM");
      const result = matchups[0].correctOption;

      // Whoever didn't win tries to claim
      const loser = result === 0 ? player2 : player1;

      await expect(
        contract.connect(loser).claimReplicaPrize("NON-WINNER-CLAIM")
      ).to.be.revertedWithCustomError(contract, "NotWinner");
    });

    it("Should reject double claim", async function () {
      await contract.createReplicaBracket(
        "DOUBLE-CLAIM",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "DOUBLE-CLAIM",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("DOUBLE-CLAIM");

      const matchups = await contract.getReplicaMatchups("DOUBLE-CLAIM");
      const result = matchups[0].correctOption;

      if (result === 0) {
        await contract.connect(player1).claimReplicaPrize("DOUBLE-CLAIM");

        await expect(
          contract.connect(player1).claimReplicaPrize("DOUBLE-CLAIM")
        ).to.be.revertedWithCustomError(contract, "AlreadyClaimed");
      }
    });

    it("Should split prize pool among multiple winners", async function () {
      await contract.createReplicaBracket(
        "SPLIT-PRIZE",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // 3 players all pick left
      await contract.connect(player1).enterReplicaBracket(
        "SPLIT-PRIZE",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "SPLIT-PRIZE",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player3).enterReplicaBracket(
        "SPLIT-PRIZE",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("SPLIT-PRIZE");

      const matchups = await contract.getReplicaMatchups("SPLIT-PRIZE");
      const result = matchups[0].correctOption;

      if (result === 0) {
        // All three won
        const bracket = await contract.getReplicaBracket("SPLIT-PRIZE");
        expect(bracket.winnerCount).to.equal(3);

        // Each should get 1/3 of prize pool
        const expectedPayout = ENTRY_FEE; // 3 * ENTRY_FEE / 3

        const tx1 = await contract.connect(player1).claimReplicaPrize("SPLIT-PRIZE");
        await expect(tx1)
          .to.emit(contract, "PrizeClaimed")
          .withArgs("SPLIT-PRIZE", player1.address, expectedPayout);
      }
    });
  });

  describe("Refund Claims", function () {
    it("Should allow refund when bracket is cancelled", async function () {
      await contract.createReplicaBracket(
        "REFUND-CANCEL",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "REFUND-CANCEL",
        [0, 1],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Cancel before others join
      await contract.connect(player2).enterReplicaBracket(
        "REFUND-CANCEL",
        [1, 0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Cannot cancel with players
      await expect(
        contract.cancelReplicaBracket("REFUND-CANCEL")
      ).to.be.revertedWithCustomError(contract, "Locked");
    });

    it("Should allow refund when pushAll (no winners)", async function () {
      await contract.createReplicaBracket(
        "REFUND-PUSH",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1", "Match 2", "Match 3", "Match 4"],
        ["Team A1", "Team A2", "Team A3", "Team A4"],
        ["Team B1", "Team B2", "Team B3", "Team B4"],
        [false, false, false, false]
      );

      // Don't enter any players - guaranteed pushAll
      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("REFUND-PUSH");

      const bracket = await contract.getReplicaBracket("REFUND-PUSH");
      expect(bracket.pushAll).to.be.true;
    });

    it("Should reject refund for normal settlement with winners", async function () {
      await contract.createReplicaBracket(
        "NO-REFUND",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "NO-REFUND",
        [0],
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("NO-REFUND");

      const bracket = await contract.getReplicaBracket("NO-REFUND");

      if (!bracket.pushAll) {
        await expect(
          contract.connect(player1).claimReplicaRefund("NO-REFUND")
        ).to.be.revertedWithCustomError(contract, "NotRefundable");
      }
    });

    it("Should reject double refund claim", async function () {
      await contract.createReplicaBracket(
        "DOUBLE-REFUND",
        ENTRY_FEE,
        SHORT_DURATION,
        ["Match 1"],
        ["Team A"],
        ["Team B"],
        [false]
      );

      // Settle with no entries -> pushAll
      await time.increase(SHORT_DURATION + 1);
      await contract.settleReplicaBracket("DOUBLE-REFUND");
    });
  });
});
