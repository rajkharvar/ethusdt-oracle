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

To run node(client), you will need to add the following environment variables to your .env file:<br/>
`ORACLE_PRIVATE_KEY`<br/>
`PROVIDER_URL`<br/>
`ETH_ORACLE_ADDRESS`

To deploy contracts, you will need to add the following environment variables to your .env file:<br/>
`PRIVATE_KEY`<br/>
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

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Usage

1. Deploy the contract to matic mumbai.(Add PRIVATE_KEY and MUMBAI_URL in `.env`)

```bash
  npx hardhat run scripts/deploy.ts --network mumbai
```

The above command will deploy `EthPriceOracl.sol` and `Caller.sol` contract. It will also update <i>threshold</i> to 1.

2. Add/Update `ETH_ORACLE_ADDRESS` and `CALLER_ADDRESS` in `.env` file which you get from above command.
3. Add/Update `ORACLE_PRIVATE_KEY` in .env file.
4. Grant <b>ORACLE_ROLE</b> to ORACLE_PRIVATE_KEY address. Change ORACLE_ADDRESS in `scripts/addOracle.ts` file.

```bash
  npx hardhat run --network mumbai scripts/addOracle.ts
```

5. Start running node.

```bash
  npm start
```

6. Generate a requestId to be reported by oracle

```
  npx hardhat run scripts/getEthPrice.ts --network mumbai
```

As soon as the above tx is confirmed the node will report eth price from API and report to oracle.

7. Latest eth price reported by oracle can be retrieved with the following command.

```bash
npx hardhat run scripts/getLatestEthPrice.ts --network mumbai
```
