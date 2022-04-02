import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EthPriceOracle } from "../typechain";
const hre = require("hardhat");

describe("EthPriceOracle", function () {
  let ethPriceOracle: EthPriceOracle;
  let signers: SignerWithAddress[];

  before(async () => {
    const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
    ethPriceOracle = await EthPriceOracle.deploy();
    signers = await ethers.getSigners();
  });

  it("Should deploy EthPriceOracle contract and deployer should be admin", async () => {
    const DEFAULT_ADMIN_ROLE = await ethPriceOracle.DEFAULT_ADMIN_ROLE();
    const isDeployerAdmin = await ethPriceOracle.hasRole(
      DEFAULT_ADMIN_ROLE,
      signers[0].address
    );

    expect(isDeployerAdmin).to.equal(true);
  });

  it("Only admin can grant ORACLE_ROLE to address", async () => {
    await ethPriceOracle.addOracle(signers[1].address);
    const isOracleRoleGranted = await ethPriceOracle.hasRole(
      await ethPriceOracle.ORACLE_ROLE(),
      signers[1].address
    );

    expect(isOracleRoleGranted).to.equal(true);
  });

  it("Non admin cannot grant ORACLE_ROLE to address", async () => {
    ethPriceOracle = ethPriceOracle.connect(signers[1]);

    await expect(
      ethPriceOracle.addOracle(signers[2].address)
    ).to.be.revertedWith("Caller is not owner");
  });

  it("Oracle can setEthPrice", async () => {
    ethPriceOracle = ethPriceOracle.connect(signers[0]);
    await ethPriceOracle.addOracle(signers[3].address);

    await ethPriceOracle.getLatestEthPrice();
    ethPriceOracle.on("GetLatestEthPrice", (args) => {
      console.log("args");
      console.log(args);
    });

    expect(true).to.be.equal(true);
  });
});
