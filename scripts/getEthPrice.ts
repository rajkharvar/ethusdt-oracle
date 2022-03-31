// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const ETH_ORACLE_ADDRESS =
  process.env.ETH_ORACLE_ADDRESS ||
  "0xAe89cf9B0ea3353a09B47489F1426fa5b43c7278";

async function main() {
  const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
  const ethPriceOracle = EthPriceOracle.attach(ETH_ORACLE_ADDRESS);

  const tx = await ethPriceOracle.getLatestEthPrice();
  console.log("Getting latest ethPrice: \ntxHash: ", tx.hash);
  await tx.wait();

  console.log("Tx successful");
  console.log(tx.data);

  console.log("tx");
  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
