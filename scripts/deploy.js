const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CelestiaBracketRush Contract...\n");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy CelestiaBracketRush
  console.log("\nDeploying CelestiaBracketRush contract...");
  const CelestiaBracketRush = await hre.ethers.getContractFactory("CelestiaBracketRush");
  const bracketRush = await CelestiaBracketRush.deploy();
  await bracketRush.waitForDeployment();
  const bracketRushAddress = await bracketRush.getAddress();

  console.log("✅ CelestiaBracketRush deployed to:", bracketRushAddress);

  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("CelestiaBracketRush:", bracketRushAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 Next Steps:");
  console.log("1. Update frontend/src/constants/contracts.ts:");
  console.log("   - CELESTIA_BRACKET_RUSH_ADDRESS:", bracketRushAddress);
  console.log("2. Generate ABI:");
  console.log("   - Copy from artifacts/contracts/CelestiaBracketRush.sol/CelestiaBracketRush.json");
  console.log("3. Start frontend: cd frontend && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
