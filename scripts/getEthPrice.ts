// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
  const ethPriceOracle = EthPriceOracle.attach(
    "0xfE1E3f8E756eFaB96c5Ed47E1c5c5C27589A2887"
  );

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
