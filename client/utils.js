const axios = require("axios");
const { BigNumber } = require("ethers");

const fetchLatestEthPrice = async () => {
  const res = await axios.get(
    "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
  );
  const ethPrice = Math.floor(parseFloat(res.data.price)).toString();
  console.log("Latest ethPrice in USDT:", ethPrice);
  return BigNumber.from(ethPrice);
};

module.exports = { fetchLatestEthPrice };
