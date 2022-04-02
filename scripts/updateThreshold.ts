import { ethers } from "hardhat";

const ETH_ORACLE_ADDRESS =
  process.env.ETH_ORACLE_ADDRESS ||
  "0x67aF75Eaf16a970BD6a3b788a6ad9E627fd26984";

async function main() {
  const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
  const ethPriceOracle = EthPriceOracle.attach(ETH_ORACLE_ADDRESS);

  const newThreshold = 2;
  const tx = await ethPriceOracle.updateThreshold(newThreshold);
  console.log("Updating threshold to ", newThreshold);
  await tx.wait();

  console.log("Threshold updated!!!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
