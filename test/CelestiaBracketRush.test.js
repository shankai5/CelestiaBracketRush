const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CelestiaBracketRush - Core Functionality", function () {
  let contract;
  let owner, player1, player2, player3;
  const ENTRY_FEE = ethers.parseEther("0.001");
  const DURATION = 3600; // 1 hour

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    const CelestiaBracketRush = await ethers.getContractFactory("CelestiaBracketRush");
    contract = await CelestiaBracketRush.deploy();
    await contract.waitForDeployment();
  });

  describe("Bracket Creation", function () {
    it("Should create a valid bracket with minimum matches", async function () {
      const tx = await contract.createReplicaBracket(
        "TEST-BRACKET-MIN",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await expect(tx)
        .to.emit(contract, "BracketCreated")
        .withArgs("TEST-BRACKET-MIN", ENTRY_FEE, await time.latest() + DURATION);

      const bracket = await contract.getReplicaBracket("TEST-BRACKET-MIN");
      expect(bracket.entryFee).to.equal(ENTRY_FEE);
    });

    it("Should create a valid bracket with maximum matches", async function () {
      const labels = Array(12).fill(0).map((_, i) => `Match ${i + 1}`);
      const optionsLeft = Array(12).fill(0).map((_, i) => `Team A${i + 1}`);
      const optionsRight = Array(12).fill(0).map((_, i) => `Team B${i + 1}`);
      const allowDraw = Array(12).fill(false);

      await contract.createReplicaBracket(
        "TEST-BRACKET-MAX",
        ENTRY_FEE,
        DURATION,
        labels,
        optionsLeft,
        optionsRight,
        allowDraw
      );

      const matchups = await contract.getReplicaMatchups("TEST-BRACKET-MAX");
      expect(matchups.length).to.equal(12);
    });

    it("Should create bracket with draw option enabled", async function () {
      await contract.createReplicaBracket(
        "TEST-BRACKET-DRAW",
        ENTRY_FEE,
        DURATION,
        ["Soccer Match", "Basketball"],
        ["Team A", "Lakers"],
        ["Team B", "Warriors"],
        [true, false] // Allow draw for first match only
      );

      const matchups = await contract.getReplicaMatchups("TEST-BRACKET-DRAW");
      expect(matchups[0].allowDraw).to.be.true;
      expect(matchups[1].allowDraw).to.be.false;
    });

    it("Should reject duplicate bracket ID", async function () {
      await contract.createReplicaBracket(
        "DUPLICATE-TEST",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await expect(
        contract.createReplicaBracket(
          "DUPLICATE-TEST",
          ENTRY_FEE,
          DURATION,
          ["Match 1", "Match 2"],
          ["Team A1", "Team A2"],
          ["Team B1", "Team B2"],
          [false, false]
        )
      ).to.be.revertedWithCustomError(contract, "BracketExists");
    });

    it("Should reject entry fee below minimum", async function () {
      await expect(
        contract.createReplicaBracket(
          "LOW-FEE-TEST",
          ethers.parseEther("0.0001"), // Too low
          DURATION,
          ["Match 1", "Match 2"],
          ["Team A1", "Team A2"],
          ["Team B1", "Team B2"],
          [false, false]
        )
      ).to.be.revertedWithCustomError(contract, "InvalidFee");
    });

    it("Should reject duration below minimum", async function () {
      await expect(
        contract.createReplicaBracket(
          "SHORT-DURATION",
          ENTRY_FEE,
          60, // 1 minute - too short
          ["Match 1", "Match 2"],
          ["Team A1", "Team A2"],
          ["Team B1", "Team B2"],
          [false, false]
        )
      ).to.be.revertedWithCustomError(contract, "InvalidDuration");
    });

    it("Should reject duration above maximum", async function () {
      await expect(
        contract.createReplicaBracket(
          "LONG-DURATION",
          ENTRY_FEE,
          22 * 24 * 3600, // 22 days - too long
          ["Match 1", "Match 2"],
          ["Team A1", "Team A2"],
          ["Team B1", "Team B2"],
          [false, false]
        )
      ).to.be.revertedWithCustomError(contract, "InvalidDuration");
    });

    it("Should reject too few matches", async function () {
      await expect(
        contract.createReplicaBracket(
          "FEW-MATCHES",
          ENTRY_FEE,
          DURATION,
          ["Match 1"], // Only 1 match
          ["Team A1"],
          ["Team B1"],
          [false]
        )
      ).to.be.revertedWithCustomError(contract, "InvalidMatches");
    });

    it("Should reject too many matches", async function () {
      const labels = Array(13).fill(0).map((_, i) => `Match ${i + 1}`);
      const optionsLeft = Array(13).fill(0).map((_, i) => `Team A${i + 1}`);
      const optionsRight = Array(13).fill(0).map((_, i) => `Team B${i + 1}`);
      const allowDraw = Array(13).fill(false);

      await expect(
        contract.createReplicaBracket(
          "MANY-MATCHES",
          ENTRY_FEE,
          DURATION,
          labels,
          optionsLeft,
          optionsRight,
          allowDraw
        )
      ).to.be.revertedWithCustomError(contract, "InvalidMatches");
    });

    it("Should reject mismatched array lengths", async function () {
      await expect(
        contract.createReplicaBracket(
          "MISMATCH-TEST",
          ENTRY_FEE,
          DURATION,
          ["Match 1", "Match 2"],
          ["Team A1"], // Wrong length
          ["Team B1", "Team B2"],
          [false, false]
        )
      ).to.be.revertedWithCustomError(contract, "InvalidMatches");
    });
  });

  describe("Bracket Listing", function () {
    it("Should list all created brackets", async function () {
      await contract.createReplicaBracket(
        "BRACKET-1",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      await contract.createReplicaBracket(
        "BRACKET-2",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      const brackets = await contract.listReplicaBrackets();
      expect(brackets.length).to.be.at.least(2);
      expect(brackets).to.include("BRACKET-1");
      expect(brackets).to.include("BRACKET-2");
    });

    it("Should return empty list when no brackets exist", async function () {
      const freshContract = await (await ethers.getContractFactory("CelestiaBracketRush")).deploy();
      const brackets = await freshContract.listReplicaBrackets();
      expect(brackets.length).to.equal(0);
    });
  });

  describe("Bracket Cancellation", function () {
    it("Should allow cancellation of bracket with no entries", async function () {
      await contract.createReplicaBracket(
        "CANCEL-TEST",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2"],
        ["Team A1", "Team A2"],
        ["Team B1", "Team B2"],
        [false, false]
      );

      const tx = await contract.cancelReplicaBracket("CANCEL-TEST");
      await expect(tx).to.emit(contract, "BracketCancelled").withArgs("CANCEL-TEST");

      const bracket = await contract.getReplicaBracket("CANCEL-TEST");
      expect(bracket.cancelled).to.be.true;
    });

    it("Should reject cancellation of non-existent bracket", async function () {
      await expect(
        contract.cancelReplicaBracket("NON-EXISTENT")
      ).to.be.revertedWithCustomError(contract, "BracketMissing");
    });
  });

  describe("View Functions", function () {
    it("Should retrieve bracket details correctly", async function () {
      await contract.createReplicaBracket(
        "VIEW-TEST",
        ENTRY_FEE,
        DURATION,
        ["Match 1", "Match 2", "Match 3"],
        ["Team A1", "Team A2", "Team A3"],
        ["Team B1", "Team B2", "Team B3"],
        [false, true, false]
      );

      const bracket = await contract.getReplicaBracket("VIEW-TEST");
      expect(bracket.entryFee).to.equal(ENTRY_FEE);
      expect(bracket.prizePool).to.equal(0);
      expect(bracket.cancelled).to.be.false;
      expect(bracket.settled).to.be.false;

      const matchups = await contract.getReplicaMatchups("VIEW-TEST");
      expect(matchups.length).to.equal(3);
      expect(matchups[0].label).to.equal("Match 1");
      expect(matchups[0].optionLeft).to.equal("Team A1");
      expect(matchups[0].optionRight).to.equal("Team B1");
      expect(matchups[1].allowDraw).to.be.true;
    });

    it("Should reject view for non-existent bracket", async function () {
      await expect(
        contract.getReplicaBracket("GHOST-BRACKET")
      ).to.be.revertedWithCustomError(contract, "BracketMissing");
    });
  });

  describe("Constants", function () {
    it("Should have correct constant values", async function () {
      expect(await contract.MIN_ENTRY_FEE()).to.equal(ethers.parseEther("0.001"));
      expect(await contract.MIN_DURATION()).to.equal(30 * 60); // 30 minutes
      expect(await contract.MAX_DURATION()).to.equal(21 * 24 * 3600); // 21 days
      expect(await contract.MIN_MATCHES()).to.equal(2);
      expect(await contract.MAX_MATCHES()).to.equal(12);
      expect(await contract.OUTCOME_LEFT()).to.equal(0);
      expect(await contract.OUTCOME_RIGHT()).to.equal(1);
      expect(await contract.OUTCOME_DRAW()).to.equal(2);
    });
  });
});
