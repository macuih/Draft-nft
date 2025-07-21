const hre = require("hardhat");

async function main() {
  const feePercent = 1; // Marketplace fee = 1%

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  // Deploy NFT contract
  const NFT = await hre.ethers.deployContract("NFT");
  await NFT.waitForDeployment();
  console.log(`NFT deployed to: ${NFT.target}`);

  // Deploy Marketplace contract
  const Marketplace = await hre.ethers.deployContract("Marketplace", [feePercent]);
  await Marketplace.waitForDeployment();
  console.log(`Marketplace deployed to: ${Marketplace.target}`);

  // Optional: write contract addresses to a file
  const fs = require("fs");
  const addresses = {
    nft: NFT.target,
    marketplace: Marketplace.target,
  };
  fs.writeFileSync("src/contract-addresses.json", JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
