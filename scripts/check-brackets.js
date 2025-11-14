const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xF5A102A2901E5b8d14d398ed186696C6A4040ebD";

  console.log("🔍 Checking CelestiaBracketRush Contract...\n");

  const contract = await hre.ethers.getContractAt("CelestiaBracketRush", CONTRACT_ADDRESS);

  try {
    const brackets = await contract.listReplicaBrackets();
    console.log("✅ Total brackets:", brackets.length);
    console.log("Bracket IDs:", brackets);

    for (let i = 0; i < brackets.length; i++) {
      const id = brackets[i];
      console.log(`\n[${i + 1}] ${id}`);

      const bracket = await contract.getReplicaBracket(id);
      console.log("  Entry Fee:", hre.ethers.formatEther(bracket[0]), "ETH");
      console.log("  Lock Time:", new Date(Number(bracket[1]) * 1000).toLocaleString());
      console.log("  Prize Pool:", hre.ethers.formatEther(bracket[2]), "ETH");
      console.log("  Cancelled:", bracket[3]);
      console.log("  Settled:", bracket[4]);
    }
  } catch (error) {
    console.error("❌ Error reading contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
