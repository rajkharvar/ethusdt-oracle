
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface CallerInterface {
  function callback(uint256 ethPrice, uint256 id) external;
}