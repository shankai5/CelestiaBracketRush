const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xF5A102A2901E5b8d14d398ed186696C6A4040ebD";

  console.log("🎯 Creating diverse test brackets...\n");

  const contract = await hre.ethers.getContractAt("CelestiaBracketRush", CONTRACT_ADDRESS);

  const brackets = [
    {
      id: "CRYPTO-QUICK-POLL",
      entryFee: hre.ethers.parseEther("0.001"),
      duration: 60 * 60,
      labels: ["Bitcoin vs Ethereum", "DeFi vs NFT", "Layer1 vs Layer2"],
      optionsLeft: ["Bitcoin", "DeFi", "Layer1"],
      optionsRight: ["Ethereum", "NFT", "Layer2"],
      allowDraw: [false, false, false]
    },
    {
      id: "WORLD-CUP-2026",
      entryFee: hre.ethers.parseEther("0.002"),
      duration: 3 * 24 * 60 * 60,
      labels: ["Group A Winner", "Group B Winner", "Top Scorer", "Final Winner"],
      optionsLeft: ["Brazil", "Argentina", "Messi", "Brazil"],
      optionsRight: ["France", "Spain", "Ronaldo", "France"],
      allowDraw: [false, false, false, false]
    },
    {
      id: "NBA-TONIGHT",
      entryFee: hre.ethers.parseEther("0.0015"),
      duration: 6 * 60 * 60,
      labels: ["Lakers vs Warriors", "Celtics vs Heat"],
      optionsLeft: ["Lakers", "Celtics"],
      optionsRight: ["Warriors", "Heat"],
      allowDraw: [false, false]
    },
    {
      id: "FLASH-PREDICTION",
      entryFee: hre.ethers.parseEther("0.001"),
      duration: 2 * 60 * 60,
      labels: ["BTC Price Direction", "ETH Gas Direction"],
      optionsLeft: ["Up", "Up"],
      optionsRight: ["Down", "Down"],
      allowDraw: [true, true]
    },
    {
      id: "CHAMPIONS-LEAGUE-QF",
      entryFee: hre.ethers.parseEther("0.003"),
      duration: 7 * 24 * 60 * 60,
      labels: ["Match 1", "Match 2", "Match 3", "Match 4"],
      optionsLeft: ["Real Madrid", "Bayern", "Man City", "PSG"],
      optionsRight: ["Barcelona", "Arsenal", "Liverpool", "Inter"],
      allowDraw: [true, true, true, true]
    },
    {
      id: "RAPID-FIRE-POLL",
      entryFee: hre.ethers.parseEther("0.001"),
      duration: 30 * 60,
      labels: ["Question 1", "Question 2", "Question 3", "Question 4"],
      optionsLeft: ["Yes", "Agree", "Bullish", "Long"],
      optionsRight: ["No", "Disagree", "Bearish", "Short"],
      allowDraw: [false, false, false, false]
    },
    {
      id: "OLYMPICS-2028",
      entryFee: hre.ethers.parseEther("0.005"),
      duration: 60 * 24 * 60 * 60,
      labels: ["Gold Medal Leader", "Basketball", "Swimming", "Track"],
      optionsLeft: ["USA", "USA", "USA", "Jamaica"],
      optionsRight: ["China", "France", "Australia", "Kenya"],
      allowDraw: [false, false, false, false]
    },
    {
      id: "DAILY-SPORTS",
      entryFee: hre.ethers.parseEther("0.002"),
      duration: 12 * 60 * 60,
      labels: ["Game 1", "Game 2", "Game 3"],
      optionsLeft: ["Team Alpha", "Team Delta", "Team Omega"],
      optionsRight: ["Team Beta", "Team Gamma", "Team Sigma"],
      allowDraw: [false, false, false]
    }
  ];

  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i];
    try {
      console.log(`[${i + 1}/${brackets.length}] Creating: ${b.id}`);
      const tx = await contract.createReplicaBracket(
        b.id, b.entryFee, b.duration, b.labels, b.optionsLeft, b.optionsRight, b.allowDraw
      );
      await tx.wait();
      console.log(`  ✅ Created!\n`);
    } catch (error) {
      if (error.message.includes("BracketExists")) {
        console.log(`  ⚠️  Already exists\n`);
      } else {
        console.error(`  ❌ Error: ${error.message}\n`);
      }
    }
  }
  console.log("\n🎉 Complete!");
}

main().then(() => process.exit(0)).catch(console.error);
