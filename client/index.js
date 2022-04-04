const ethers = require("ethers");
const {
  ETH_ORACLE_ADDRESS,
  PRIVATE_KEY,
  PROVIDER_URL,
} = require("./constants");

const EthPriceOracleABI = require("../abi/EthPriceOracle.json");
const { fetchLatestEthPrice } = require("./utils");

let wallet;
let provider;

const getOracleContractInstance = () => {
  return new ethers.Contract(ETH_ORACLE_ADDRESS, EthPriceOracleABI, wallet);
};

const filterEvents = async () => {
  console.log("Listening for events...");
  const ethPriceOracleContract = getOracleContractInstance();

  ethPriceOracleContract.on("GetLatestEthPrice", (...args) => {
    const [callerAddress, id] = args;
    console.log(
      `Recevied request from ${callerAddress} for id: ${id.toNumber()}`
    );
    processRequest(callerAddress, id);
  });

  ethPriceOracleContract.on("SetLatestEthPrice", (...args) => {
    console.log("Latest ethPrice updated");

    console.log(`Latest Eth price reported by oracle: ${args[0].toNumber()}`);
  });
};

const processRequest = async (callerAddress, id) => {
  console.log(`Processing request`);
  const ethPrice = await fetchLatestEthPrice();
  const ethPriceOracleContract = getOracleContractInstance();

  const isRequestPending = await checkRequestPending(id);

  if (isRequestPending) {
    const tx = await ethPriceOracleContract.setLatestEthPrice(
      ethPrice,
      callerAddress,
      id
    );
    await tx.wait();

    console.log("Successfully reported latest ethPrice!");
  } else {
    console.log(`Request id ${id} has been already processed`);
  }
};

const checkRequestPending = async (id) => {
  const ethPriceOracleContract = getOracleContractInstance();
  const isRequestPending = await ethPriceOracleContract.pendingRequests(id);
  return isRequestPending;
};

const init = async () => {
  try {
    if (PRIVATE_KEY === undefined || PRIVATE_KEY === "") {
      console.log("Please add private in .env");
      return;
    }
    if (PROVIDER_URL === undefined || PROVIDER_URL === "") {
      console.log("Please add provider URL in .env");
      return;
    }
    provider = ethers.providers.getDefaultProvider(PROVIDER_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`Successfully loaded ${wallet.address} from privateKey`);
    filterEvents();
  } catch (err) {
    console.log(err);
  }
};

init();
