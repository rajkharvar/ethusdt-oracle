// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

const CALLER_ADDRESS =
  process.env.CALLER_ADDRESS || "0x2c3628E2E6464717a4753fae99C9bca539d25E7e";

async function main() {
  console.log("CALLER_ADDRESS");
  console.log(CALLER_ADDRESS);
  const Caller = await ethers.getContractFactory("Caller");
  const caller = Caller.attach(CALLER_ADDRESS);

  console.log("Generating request...");

  const tx = await caller.updateLatestPrice();
  await tx.wait();

  console.log("tx");
  console.log(tx);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
