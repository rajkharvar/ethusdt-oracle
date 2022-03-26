// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface EthPriceOracleInterface {
  function getLatestEthPrice() external returns(uint256);
}