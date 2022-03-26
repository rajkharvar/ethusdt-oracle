const ethers = require("ethers");
const {
  ETH_ORACLE_ADDRESS,
  PRIVATE_KEY,
  PROVIDER_URL,
} = require("./constants");
const { fetchLatestEthPrice } = require("./utils");

const EthPriceOracleABI = require("../abi/EthPriceOracle.json");
const CallerABI = require("../abi/Caller.json");

let wallet;
let provider;

const filterEvents = async () => {
  const ethPriceOracleContract = new ethers.Contract(
    ETH_ORACLE_ADDRESS,
    EthPriceOracleABI,
    wallet
  );

  ethPriceOracleContract.on("GetLatestEthPrice", (...args) => {
    console.log("event");
    console.log(args);
  });
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
    filterEvents();
    console.log(`Successfully loaded ${wallet.address} from privateKey`);
  } catch (err) {
    console.log(err);
  }
};

init();
