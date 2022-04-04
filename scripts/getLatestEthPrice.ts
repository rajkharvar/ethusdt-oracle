import { ethers } from "hardhat";

const CALLER_ADDRESS =
  process.env.CALLER_ADDRESS || "0x2c3628E2E6464717a4753fae99C9bca539d25E7e";

async function main() {
  const Caller = ethers.getContractFactory("Caller");
  const caller = (await Caller).attach(CALLER_ADDRESS);

  const ethPrice = await caller.getEthPrice();

  console.log(`Latest ethPrice reported by oracle: ${ethPrice.toNumber()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
