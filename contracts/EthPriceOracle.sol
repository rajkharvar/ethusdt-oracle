// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./interface/Caller.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EthPriceOracle is AccessControl {
  using SafeMath for uint256;
  address private owner;
  bytes32 public constant ORACLE_ROLE = 0x68e79a7bf1e0bc45d0a330c573bc367f9cf464fd326078812f301165fbda4ef1;

  uint private randNonce = 0;
  uint private modulus = 1000;
  uint16 public numOracles = 0;
  uint16 public threshold = 0;

  struct Response {
    address oracleAddress;
    address callerAddress;
    uint256 ethPrice;
  }

  mapping(uint256 => bool) pendingRequests;
  mapping(uint256 => Response[]) requestIdToResponse;

  event OracleAdded(address indexed oracleAddress);
  event OracleRemoved(address indexed oracleAddress);
  event ThresholdUpdated(uint16 newThreshold);
  event GetLatestEthPrice(address callerAddress, uint id);
  event SetLatestEthPrice(uint256 ethPrice, address callerAddress, uint256 id);


  modifier onlyOwner() {
    require(owner == msg.sender, "Caller is not owner");
    _;
  }
  
  constructor() {
    owner = msg.sender;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /// @notice Grant oracle role to address
  /// @dev Only admin can give access to new oracle address
  /// @param _oracle address to grant access for ORACLE_ROLE
  function addOracle(address _oracle) public onlyOwner {
    require(!hasRole(ORACLE_ROLE, _oracle), "Oracle role already exists");
    numOracles++;
    grantRole(ORACLE_ROLE, _oracle);
    emit OracleAdded(_oracle);
  }
  
  /// @notice Revoke oracle role from address
  /// @dev Only admin can give revoke oracle role\
  /// @param _oracle address to revoke access for ORACLE_ROLE
  function removeOracle(address _oracle) public onlyOwner {
    require(hasRole(ORACLE_ROLE, _oracle), "Oracle role doesn't exist");
    numOracles--;
    revokeRole(ORACLE_ROLE, _oracle);
    emit OracleRemoved(_oracle);
  }

  /// @notice Update threshold of oracles to update price
  /// @dev Only admin can update threshold
  function updateThreshold(uint16 _newThreshold) public onlyOwner {
    threshold = _newThreshold;
    emit ThresholdUpdated(_newThreshold);
  }

  /// @notice Adds unique id to pending requests
  /// @dev Returns unique which is being added to pending requests
  /// @return id
  function getLatestEthPrice() public returns(uint256) {
    randNonce++;
    uint id = uint(keccak256(abi.encodePacked(msg.sender, block.timestamp, randNonce))) % modulus;
    pendingRequests[id] = true;
    emit GetLatestEthPrice(msg.sender, id);
    return id;
  }

  /// @notice Oracle sends response for id
  /// @dev Oracle submits ethPrice response for id
  /// @param _ethPrice ethPrice for id
  /// @param _callerAddress callerAddress contract
  /// @param _id requestId
  function setLatestEthPrice(uint256 _ethPrice, address _callerAddress ,uint256 _id) public {
    require(hasRole(ORACLE_ROLE, msg.sender), "Only oracle can set ethPrice");
    require(pendingRequests[_id] == true, "This request id is not in pending list");
    Response memory resp;
    resp = Response(msg.sender, _callerAddress, _ethPrice);
    requestIdToResponse[_id].push(resp);
    uint256 numResponses = requestIdToResponse[_id].length;
    if (numResponses == threshold) {
      uint256 computedEthPrice = 0;
      for (uint256 i = 0; i < numResponses; i++) {
        computedEthPrice = computedEthPrice.add(requestIdToResponse[_id][i].ethPrice);
      }
      computedEthPrice = computedEthPrice.div(numResponses);
      CallerInterface callerInstance;
      callerInstance = CallerInterface(_callerAddress);
      callerInstance.callback(computedEthPrice, _id);
      emit SetLatestEthPrice(computedEthPrice, _callerAddress, _id);
    }
  }
}