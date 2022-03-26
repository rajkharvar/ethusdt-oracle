// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
  const ethPriceOracle = await EthPriceOracle.deploy();
  await ethPriceOracle.deployed();

  const ethPriceOracleAddress = ethPriceOracle.address;
  console.log("Deployed ethPrice oracle at: ", ethPriceOracleAddress);

  // Update threshold to 1
  const tx = await ethPriceOracle.updateThreshold(1);
  console.log("Updating threshold to 1, please wait... \ntxHash: ", tx.hash);
  tx.wait();
  console.log("Updated threshold to 1");

  const Caller = await ethers.getContractFactory("Caller");
  const caller = await Caller.deploy(ethPriceOracleAddress);
  await caller.deployed();
  const callerAddress = caller.address;
  console.log("Caller deployed at: ", callerAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
