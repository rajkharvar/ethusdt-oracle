require("dotenv").config();

const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const PROVIDER_URL = process.env.PROVIDER_URL;

const ETH_ORACLE_ADDRESS = process.env.ETH_ORACLE_ADDRESS;
const CALLER_ADDRESS = process.env.CALLER_ADDRESS;

module.exports = {
  PRIVATE_KEY,
  PROVIDER_URL,
  ETH_ORACLE_ADDRESS,
  CALLER_ADDRESS,
};
