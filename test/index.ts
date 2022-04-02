import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Caller, EthPriceOracle } from "../typechain";
const hre = require("hardhat");

describe("EthPriceOracle", function () {
  let ethPriceOracle: EthPriceOracle;
  let signers: SignerWithAddress[];
  let caller: Caller;

  before(async () => {
    const EthPriceOracle = await ethers.getContractFactory("EthPriceOracle");
    ethPriceOracle = await EthPriceOracle.deploy();
    const Caller = await ethers.getContractFactory("Caller");
    caller = await Caller.deploy(ethPriceOracle.address);

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

  it("Caller address in GetLatestEthPrice event is same as deployed address", async () => {
    await caller.updateLatestPrice();
    let callerAddress: string | undefined;

    ethPriceOracle.on("GetLatestEthPrice", async (...args) => {
      callerAddress = args[0];
    });

    await new Promise((resolve) => setTimeout(() => resolve(null), 5000));
    expect(callerAddress).to.be.equal(caller.address);
  });

  it("dApp can updateLatestPrice() and random id is generated between 1 to 999", async () => {
    let id: number | undefined;
    await caller.updateLatestPrice();

    ethPriceOracle.on("GetLatestEthPrice", (...args) => {
      id = args[1].toNumber();
    });

    await new Promise((resolve) => setTimeout(() => resolve(null), 5000));
    expect(id).to.be.gt(0).lt(1000);
  });

  it("Oracle can setEthPrice", async () => {
    let ethPrice: BigNumber | undefined;
    // Generated request
    caller = caller.connect(signers[2]);
    ethPriceOracle = ethPriceOracle.connect(signers[0]);
    await caller.updateLatestPrice();
    await ethPriceOracle.updateThreshold(1);

    // Listen to event and setLatestEthPrice
    ethPriceOracle.on("GetLatestEthPrice", async (...args) => {
      console.log("Args from GetLatestEthPrice");
      console.log(args);
      const id: BigNumber = args[1];
      const tx = await ethPriceOracle.setLatestEthPrice(
        BigNumber.from(3000),
        caller.address,
        id
      );
      await tx.wait();
    });

    await new Promise((resolve) => setTimeout(() => resolve(null), 5000));

    ethPriceOracle.on("SetLatestEthPrice", (...args) => {
      console.log("Args from SetLatestEthPrice");
      console.log(args);
    });

    await new Promise((resolve) => setTimeout(() => resolve(null), 5000));

    expect(ethPrice).to.be.equal(3000);
  });
});
