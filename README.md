# ETH-USDT Oracle

The Oracle works on the basis of publisher-subscriber technique. Any dApp can generate request to get latest ETH price in USDT.
Node (client) listens for generated request and reports price.

## Contracts

1. EthPriceOracle.sol - Used by nodes(client).
2. Caller.sol - Used by dApp.

## Working

1. dApp calls `updateLatestPrice()` of `Caller.sol` contract which returns a randomly generated id.
2. Node listens for `GetLatestEthPrice` event of `EthPriceOracle.sol` contract and starts reporting latest ETH price in USDT for request from [Binance ticker](https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT).
3. As soon as responses for request id reaches to **threshold** value, mean of all the reported responses is considered as final price.
4. dApp listens for `PriceUpdated` event of `Caller.sol` to get the updated price.
5. dApp can also access the latest price reported by oracle by calling `getEthPrice()`.

## Environment Variables

To run node(client), you will need to add the following environment variables to your .env file
`ORACLE_PRIVATE_KEY`
`PROVIDER_URL`
`ETH_ORACLE_ADDRESS`

To deploy contracts, you will need to add the following environment variables to your .env file:
`PRIVATE_KEY`
`MUMBAI_URL`

## Deployment

To deploy the contracts run

```bash
  npm install
  npx hardhat run scripts/deploy.ts --network [NETWORK_NAME]
```

## Running a node

To start node on local run

```bash
  npm start
```
