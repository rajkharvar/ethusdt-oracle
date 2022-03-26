// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/EthPriceOracle.sol";

contract Caller is Ownable {
  uint256 private ethPrice;
  address private oracleAddress;
  EthPriceOracleInterface private oracleInstance;

  event PriceUpdated(uint256 ethPrice, uint256 id, address oracleAddress);
  event OracleAddressUpdated(address oracleAddress);
  event ReceivedNewRequest(uint256 id);

  mapping(uint256 => bool) requests;

  constructor(address _oracleAddress) {
    oracleAddress = _oracleAddress;
    emit OracleAddressUpdated(_oracleAddress);
  }

  /// @dev Only owner can update oracleAddress
  /// @param _oracleInstanceAddress New oracle address
  function setOracleInstanceAddress(address _oracleInstanceAddress) public onlyOwner {
    oracleAddress = _oracleInstanceAddress;
    oracleInstance = EthPriceOracleInterface(_oracleInstanceAddress);
    emit OracleAddressUpdated(_oracleInstanceAddress);
  }

  /// @notice Request to update ethPrice
  /// @dev Call is made to oracle to new request id
  function updateLatestPrice() public {
    uint256 id = oracleInstance.getLatestEthPrice();
    requests[id] = true;
    emit ReceivedNewRequest(id);
  }
  
  /// @notice Updates ethPrice
  /// @dev oracle call this function to update ethPrice
  /// @param _ethPrice New ethPrice
  /// @param _id requestId which was to be resolved
  function callback(uint256 _ethPrice, uint256 _id) public onlyOracle {
    require(requests[_id] == true, "This request id is not in pending list");
    ethPrice = _ethPrice;
    delete requests[_id];
    emit PriceUpdated(ethPrice, _id, msg.sender);
  }

  modifier onlyOracle {
    require(msg.sender == oracleAddress, "You are not authorized to call this function");
    _;
  }
}