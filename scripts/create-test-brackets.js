const hre = require("hardhat");

async function main() {
  console.log("🎯 Creating Test Brackets on Sepolia...\n");

  const CONTRACT_ADDRESS = "0xF5A102A2901E5b8d14d398ed186696C6A4040ebD";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Creating brackets with account:", deployer.address);

  // Get contract instance
  const CelestiaBracketRush = await hre.ethers.getContractAt("CelestiaBracketRush", CONTRACT_ADDRESS);

  // Test bracket configurations
  const brackets = [
    {
      bracketId: "NBA-FINALS-2025",
      entryFee: hre.ethers.parseEther("0.001"), // 0.001 ETH
      duration: 7 * 24 * 60 * 60, // 7 days
      labels: ["Game 1", "Game 2", "Game 3", "Game 4"],
      optionsLeft: ["Lakers", "Lakers", "Lakers", "Lakers"],
      optionsRight: ["Celtics", "Celtics", "Celtics", "Celtics"],
      allowDraw: [false, false, false, false]
    },
    {
      bracketId: "WORLD-CUP-2026",
      entryFee: hre.ethers.parseEther("0.002"), // 0.002 ETH
      duration: 14 * 24 * 60 * 60, // 14 days
      labels: ["Match 1", "Match 2", "Match 3", "Match 4", "Match 5"],
      optionsLeft: ["Brazil", "Argentina", "France", "Germany", "Spain"],
      optionsRight: ["England", "Portugal", "Italy", "Netherlands", "Belgium"],
      allowDraw: [true, true, true, true, true]
    },
    {
      bracketId: "ESPORTS-LEAGUE-S3",
      entryFee: hre.ethers.parseEther("0.0015"), // 0.0015 ETH
      duration: 5 * 24 * 60 * 60, // 5 days
      labels: ["Quarterfinal 1", "Quarterfinal 2", "Semifinal", "Final"],
      optionsLeft: ["Team Liquid", "Cloud9", "Winner QF1", "Winner SF"],
      optionsRight: ["TSM", "100 Thieves", "Winner QF2", "Winner SF"],
      allowDraw: [false, false, false, false]
    },
    {
      bracketId: "CRYPTO-PREDICTIONS",
      entryFee: hre.ethers.parseEther("0.003"), // 0.003 ETH
      duration: 30 * 24 * 60 * 60, // 30 days
      labels: ["BTC vs 50k", "ETH vs 3k", "SOL vs 100"],
      optionsLeft: ["Above", "Above", "Above"],
      optionsRight: ["Below", "Below", "Below"],
      allowDraw: [false, false, false]
    },
    {
      bracketId: "TECH-EVENTS-2025",
      entryFee: hre.ethers.parseEther("0.0012"), // 0.0012 ETH
      duration: 60 * 24 * 60 * 60, // 60 days
      labels: ["Apple Event", "Google I/O", "AWS re:Invent", "Microsoft Build", "Meta Connect", "NVIDIA GTC"],
      optionsLeft: ["Major Release", "Major Release", "Major Release", "Major Release", "Major Release", "Major Release"],
      optionsRight: ["No Major Release", "No Major Release", "No Major Release", "No Major Release", "No Major Release", "No Major Release"],
      allowDraw: [false, false, false, false, false, false]
    }
  ];

  console.log(`\nCreating ${brackets.length} test brackets...\n`);

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];

    try {
      console.log(`[${i + 1}/${brackets.length}] Creating: ${bracket.bracketId}`);
      console.log(`  - Entry Fee: ${hre.ethers.formatEther(bracket.entryFee)} ETH`);
      console.log(`  - Duration: ${bracket.duration / (24 * 60 * 60)} days`);
      console.log(`  - Matches: ${bracket.labels.length}`);

      const tx = await CelestiaBracketRush.createReplicaBracket(
        bracket.bracketId,
        bracket.entryFee,
        bracket.duration,
        bracket.labels,
        bracket.optionsLeft,
        bracket.optionsRight,
        bracket.allowDraw
      );

      console.log(`  - Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`  ✅ Created successfully!\n`);

    } catch (error) {
      console.error(`  ❌ Failed to create ${bracket.bracketId}:`, error.message);
      console.log("");
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Test bracket creation complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\nYou can now test the frontend with these brackets.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
