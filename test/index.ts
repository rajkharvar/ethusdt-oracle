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

  it("Oracle can set ethPrice", async () => {
    // Generated request
    ethPriceOracle = ethPriceOracle.connect(signers[0]);
    await caller.updateLatestPrice();
    await ethPriceOracle.updateThreshold(1);
    await ethPriceOracle.addOracle(signers[4].address);
    ethPriceOracle = ethPriceOracle.connect(signers[4]);

    const getLatestEthPrice: any = new Promise((resolve, reject) => {
      ethPriceOracle.on(
        "GetLatestEthPrice",
        (callerAddress: string, id: BigNumber, event) => {
          event.removeListener();
          resolve({
            id,
            callerAddress,
          });
        }
      );

      setTimeout(() => {
        reject(new Error("timeout"));
      }, 6000);
    });

    const event = await getLatestEthPrice;

    await ethPriceOracle.setLatestEthPrice(
      BigNumber.from(3000),
      event.callerAddress,
      event.id
    );

    const ethPrice = (await caller.getEthPrice()).toNumber();
    expect(ethPrice).to.be.equal(3000);
  });

  it("Oracle cannot vote twice for single requestId", async () => {
    // Add oracle
    ethPriceOracle = ethPriceOracle.connect(signers[0]);
    await ethPriceOracle.addOracle(signers[3].address);
    ethPriceOracle = ethPriceOracle.connect(signers[3]);
    await caller.updateLatestPrice();

    const getLatestEthPrice: any = new Promise((resolve, reject) => {
      ethPriceOracle.on(
        "GetLatestEthPrice",
        (callerAddress: string, id: BigNumber, event) => {
          event.removeListener();
          resolve({
            id,
            callerAddress,
          });
        }
      );

      setTimeout(() => {
        reject(new Error("timeout"));
      }, 6000);
    });

    const event = await getLatestEthPrice;

    await ethPriceOracle.setLatestEthPrice(
      BigNumber.from(3000),
      event.callerAddress,
      event.id
    );

    await expect(
      ethPriceOracle.setLatestEthPrice(
        BigNumber.from(3000),
        event.callerAddress,
        event.id
      )
    ).to.be.revertedWith("Oracle can only vote once");
  });
});
