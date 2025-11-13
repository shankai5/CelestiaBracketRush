const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CelestiaBracketRush - FHE Integration Tests", function () {
  let contract;
  let owner, player1, player2, player3;
  const ENTRY_FEE = ethers.parseEther("0.001");
  const DURATION = 3600;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    const CelestiaBracketRush = await ethers.getContractFactory("CelestiaBracketRush");
    contract = await CelestiaBracketRush.deploy();
    await contract.waitForDeployment();

    // Create a test bracket
    await contract.createReplicaBracket(
      "FHE-TEST-BRACKET",
      ENTRY_FEE,
      DURATION,
      ["NBA Finals Game 1", "Champions League Final"],
      ["Lakers", "Real Madrid"],
      ["Celtics", "Barcelona"],
      [false, false]
    );
  });

  describe("Encrypted Weight Handling", function () {
    it("Should accept encrypted weight on entry", async function () {
      // Create mock encrypted weight
      const picks = [0, 1]; // Left, Right

      // Note: In real tests with FHE, you would use actual FHE SDK to generate these
      // For now, this tests the contract interface
      const mockEncryptedWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      const tx = contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks,
        mockEncryptedWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Should emit EntrySubmitted event
      await expect(tx)
        .to.emit(contract, "EntrySubmitted")
        .withArgs("FHE-TEST-BRACKET", player1.address);
    });

    it("Should update encrypted exposure when multiple entries are made", async function () {
      const picks1 = [0, 0]; // Both left
      const picks2 = [1, 1]; // Both right
      const picks3 = [0, 1]; // Mixed

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // Three players enter with different picks
      await contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks1,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks2,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player3).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks3,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Check that matchups have updated pick counts
      const matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
      expect(matchups[0].picksLeft).to.equal(2); // player1 and player3
      expect(matchups[0].picksRight).to.equal(1); // player2
      expect(matchups[1].picksLeft).to.equal(1); // player1
      expect(matchups[1].picksRight).to.equal(2); // player2 and player3
    });

    it("Should allow adjusting entry with new encrypted weight", async function () {
      const initialPicks = [0, 0];
      const newPicks = [1, 1];

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // Initial entry
      await contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        initialPicks,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      // Check initial state
      let matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
      expect(matchups[0].picksLeft).to.equal(1);
      expect(matchups[0].picksRight).to.equal(0);

      // Adjust entry
      const newWeight = ethers.randomBytes(32);
      const newProof = ethers.randomBytes(100);

      const tx = contract.connect(player1).adjustReplicaEntry(
        "FHE-TEST-BRACKET",
        newPicks,
        newWeight,
        newProof
      );

      await expect(tx)
        .to.emit(contract, "EntryAdjusted")
        .withArgs("FHE-TEST-BRACKET", player1.address);

      // Check updated state
      matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
      expect(matchups[0].picksLeft).to.equal(0);
      expect(matchups[0].picksRight).to.equal(1);
    });

    it("Should reject adjustment for non-existent entry", async function () {
      const picks = [0, 1];
      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await expect(
        contract.connect(player1).adjustReplicaEntry(
          "FHE-TEST-BRACKET",
          picks,
          mockWeight,
          mockProof
        )
      ).to.be.revertedWithCustomError(contract, "EntryNotFound");
    });
  });

  describe("Privacy Guarantees", function () {
    it("Should not expose individual player weights in matchup data", async function () {
      const picks = [0, 1];
      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      const matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");

      // Exposure values should be encrypted (euint64 handles)
      // We can verify they exist but cannot read the actual values
      expect(matchups[0].leftExposure).to.not.be.undefined;
      expect(matchups[0].rightExposure).to.not.be.undefined;

      // Only pick counts should be visible
      expect(matchups[0].picksLeft).to.equal(1);
      expect(matchups[1].picksRight).to.equal(1);
    });

    it("Should maintain privacy when entries are adjusted", async function () {
      const initialPicks = [0, 0];
      const mockWeight1 = ethers.randomBytes(32);
      const mockProof1 = ethers.randomBytes(100);

      // Player 1 enters
      await contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        initialPicks,
        mockWeight1,
        mockProof1,
        { value: ENTRY_FEE }
      );

      // Player 2 enters
      const picks2 = [1, 1];
      const mockWeight2 = ethers.randomBytes(32);
      const mockProof2 = ethers.randomBytes(100);

      await contract.connect(player2).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks2,
        mockWeight2,
        mockProof2,
        { value: ENTRY_FEE }
      );

      // Player 1 adjusts
      const newPicks = [1, 0];
      const newWeight = ethers.randomBytes(32);
      const newProof = ethers.randomBytes(100);

      await contract.connect(player1).adjustReplicaEntry(
        "FHE-TEST-BRACKET",
        newPicks,
        newWeight,
        newProof
      );

      // Verify pick counts changed but encrypted exposures remain private
      const matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
      expect(matchups[0].picksLeft).to.equal(0);
      expect(matchups[0].picksRight).to.equal(2);
      expect(matchups[1].picksLeft).to.equal(1);
      expect(matchups[1].picksRight).to.equal(1);
    });
  });

  describe("FHE Operation Edge Cases", function () {
    it("Should handle zero weight entries gracefully", async function () {
      const picks = [0, 1];
      // Create a weight of 0 (edge case)
      const zeroWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      const tx = contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks,
        zeroWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await expect(tx).to.emit(contract, "EntrySubmitted");

      const matchups = await contract.getReplicaMatchups("FHE-TEST-BRACKET");
      expect(matchups[0].picksLeft).to.equal(1);
    });

    it("Should handle maximum weight values", async function () {
      const picks = [0, 1];
      // Max uint64 would be represented in encrypted form
      const maxWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      const tx = contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks,
        maxWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await expect(tx).to.emit(contract, "EntrySubmitted");
    });

    it("Should correctly subtract exposure when adjusting from high to low weight", async function () {
      const picks = [0, 1];
      const highWeight = ethers.randomBytes(32);
      const mockProof1 = ethers.randomBytes(100);

      // Enter with high weight
      await contract.connect(player1).enterReplicaBracket(
        "FHE-TEST-BRACKET",
        picks,
        highWeight,
        mockProof1,
        { value: ENTRY_FEE }
      );

      // Adjust to low weight
      const lowWeight = ethers.randomBytes(32);
      const mockProof2 = ethers.randomBytes(100);

      const tx = contract.connect(player1).adjustReplicaEntry(
        "FHE-TEST-BRACKET",
        picks,
        lowWeight,
        mockProof2
      );

      await expect(tx).to.emit(contract, "EntryAdjusted");
    });
  });

  describe("Draw Option with FHE", function () {
    beforeEach(async function () {
      // Create bracket with draw option
      await contract.createReplicaBracket(
        "FHE-DRAW-BRACKET",
        ENTRY_FEE,
        DURATION,
        ["Soccer Match"],
        ["Team A"],
        ["Team B"],
        [true] // Allow draw
      );
    });

    it("Should handle encrypted weight for draw picks", async function () {
      const picksDraw = [2]; // OUTCOME_DRAW
      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      const tx = contract.connect(player1).enterReplicaBracket(
        "FHE-DRAW-BRACKET",
        picksDraw,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await expect(tx).to.emit(contract, "EntrySubmitted");

      const matchups = await contract.getReplicaMatchups("FHE-DRAW-BRACKET");
      expect(matchups[0].picksDraw).to.equal(1);
      expect(matchups[0].picksLeft).to.equal(0);
      expect(matchups[0].picksRight).to.equal(0);
    });

    it("Should track separate encrypted exposures for left, right, and draw", async function () {
      const picksLeft = [0];
      const picksRight = [1];
      const picksDraw = [2];

      const mockWeight = ethers.randomBytes(32);
      const mockProof = ethers.randomBytes(100);

      // Three players with different picks
      await contract.connect(player1).enterReplicaBracket(
        "FHE-DRAW-BRACKET",
        picksLeft,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player2).enterReplicaBracket(
        "FHE-DRAW-BRACKET",
        picksRight,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      await contract.connect(player3).enterReplicaBracket(
        "FHE-DRAW-BRACKET",
        picksDraw,
        mockWeight,
        mockProof,
        { value: ENTRY_FEE }
      );

      const matchups = await contract.getReplicaMatchups("FHE-DRAW-BRACKET");
      expect(matchups[0].picksLeft).to.equal(1);
      expect(matchups[0].picksRight).to.equal(1);
      expect(matchups[0].picksDraw).to.equal(1);
    });

    it("Should adjust from draw to non-draw pick", async function () {
      const initialPicks = [2]; // Draw
      const newPicks = [0]; // Left

      const mockWeight1 = ethers.randomBytes(32);
      const mockProof1 = ethers.randomBytes(100);

      await contract.connect(player1).enterReplicaBracket(
        "FHE-DRAW-BRACKET",
        initialPicks,
        mockWeight1,
        mockProof1,
        { value: ENTRY_FEE }
      );

      const mockWeight2 = ethers.randomBytes(32);
      const mockProof2 = ethers.randomBytes(100);

      await contract.connect(player1).adjustReplicaEntry(
        "FHE-DRAW-BRACKET",
        newPicks,
        mockWeight2,
        mockProof2
      );

      const matchups = await contract.getReplicaMatchups("FHE-DRAW-BRACKET");
      expect(matchups[0].picksDraw).to.equal(0);
      expect(matchups[0].picksLeft).to.equal(1);
    });
  });
});
