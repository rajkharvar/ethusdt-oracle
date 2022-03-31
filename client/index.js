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
  console.log("Listening for events");
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

    console.log("args");
    console.log(args);
  });
};

const processRequest = async (callerAddress, id) => {
  console.log(`Processing request`);
  console.log("id");
  console.log(id);
  const ethPrice = await fetchLatestEthPrice();
  console.log(
    `Sending tx for requestId: ${id.toNumber()} with ethPrice: ${ethPrice}`
  );
  const ethPriceOracleContract = getOracleContractInstance();

  const tx = await ethPriceOracleContract.setLatestEthPrice(
    ethPrice,
    callerAddress,
    id
  );
  await tx.wait();

  console.log("tx");
  console.log(tx);
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
