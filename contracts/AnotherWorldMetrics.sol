// SPDX-License-Identifier: MIT
//
// AnotherWorldMetrics.sol
//
// Another World's onchain metrics on Gnosis
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AnotherWorldMetrics is Ownable {

    event updatedMetrics(uint256 totalTwitterFollowers, uint256 totalPlaySessions);

    uint256 public totalPlaySessions = 0;
    uint256 public totalTwitterFollowers = 0;
    string public constant twitterHandle = "AnotherWorldDAO";

    address public metricsOperator;

    constructor() {
        metricsOperator = msg.sender; // server operator
    }

    function setMetricsOperator(address newMetricsOperator) public onlyOwner {
        metricsOperator = newMetricsOperator;
    }

    function setMetrics(uint256 newTotalTwitterFollowers, uint256 newTotalPlaySessions) public {
        require(msg.sender == metricsOperator, "invalid operator"); // only metricsOperator can update
        require(newTotalPlaySessions >= totalPlaySessions, "invalid number");
        totalTwitterFollowers = newTotalTwitterFollowers;
        totalPlaySessions = newTotalPlaySessions;
        emit updatedMetrics(totalTwitterFollowers, totalPlaySessions);
    }
}