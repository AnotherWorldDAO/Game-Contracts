// SPDX-License-Identifier: MIT
//
// LedgerOfUserRecords.sol
//
// triggerred by game clients and updated by operator of Another World on GG/SAGA chain
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LedgerOfUserRecords is Ownable {

    event UserStateUpdatedByAdmin(address, uint256, uint256);

    uint256 public userCount = 0;

    mapping(address => uint256) public userStates; // user states set by game
    mapping(address => uint256) public userTimestamps; // user timestamps set by game
    mapping(address => uint256) public userAdminStates; // user states set by admins
    mapping(address => uint256) public userAdminTimestamps; // user timestamps set when state is updated

    address public ledgerOperator;

    constructor() {
        ledgerOperator = msg.sender; // server operator
    }

    function setLedgerOperator(address newLedgerOperator) public onlyOwner {
        ledgerOperator = newLedgerOperator;
    }

    function setUserState(address userAddress, uint256 userState) public {
        require(msg.sender == ledgerOperator, "invalid operator"); // only ledgerOperator can update
        require(userState > 0, "invalid state");
        userStates[userAddress] = userState;
        userTimestamps[userAddress] = block.timestamp;
        if (userAdminStates[userAddress] < 1) {
            userAdminStates[userAddress] = 1;
            unchecked {
                userCount++;
            }
        }
    }

    function setUserAdminState(address userAddress, uint256 userState) public {
        require(msg.sender == ledgerOperator, "invalid operator"); // only ledgerOperator can update
        require(userAdminStates[userAddress] > 0, "invalid user");
        userAdminStates[userAddress] = userState;
        userAdminTimestamps[userAddress] = block.timestamp;
        emit UserStateUpdatedByAdmin(userAddress, userState, block.timestamp);
    }

}