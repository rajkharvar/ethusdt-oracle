import { ethers } from "hardhat";

const ORACLE_ADDRESS = "0x67aF75Eaf16a970BD6a3b788a6ad9E627fd26984";
const ETH_ORACLE_ADDRESS =
  process.env.ETH_ORACLE_ADDRESS ||
  "0x67aF75Eaf16a970BD6a3b788a6ad9E627fd26984";

async function main() {
  console.log("ETH_ORACLE_ADDRESS");
  console.log(ETH_ORACLE_ADDRESS);
  const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
  const ethPriceOracle = EthPriceOracle.attach(ETH_ORACLE_ADDRESS);

  const checkRoleExist = await ethPriceOracle.hasRole(
    "0x68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef1",
    ORACLE_ADDRESS
  );

  console.log("checkRoleExist: ", checkRoleExist);

  const tx = await ethPriceOracle.addOracle(ORACLE_ADDRESS);
  console.log("Adding oracle to network \ntxHash: ", tx.hash);
  await tx.wait();

  console.log("Successfully added oracle address to network!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
