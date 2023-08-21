// SPDX-License-Identifier: MIT
//
// AnotherWorldMetricsV2.sol
//
// Another World's onchain metrics
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AnotherWorldMetricsV2 is Ownable {
    event updatedMetrics(
        uint256 totalTwitterFollowers,
        uint256 totalPlaySessions,
        uint256 totalPlayerWallets
    );

    uint256 public totalPlaySessions = 0;
    uint256 public totalTwitterFollowers = 0;
    uint256 public totalPlayerWallets = 0;
    string public constant twitterHandle = "AnotherWorldDAO";
    string public constant DuneUrl =
        "https://dune.com/jackieleeeth/anotherworld";

    address public metricsOperator;

    constructor() {
        metricsOperator = msg.sender; // server operator
    }

    function setMetricsOperator(address newMetricsOperator) public onlyOwner {
        metricsOperator = newMetricsOperator;
    }

    function setMetrics(
        uint256 newTotalTwitterFollowers,
        uint256 newTotalPlaySessions,
        uint256 newTotalPlayerWallets
    ) public {
        require(msg.sender == metricsOperator, "invalid operator"); // only metricsOperator can update
        require(
            newTotalPlaySessions >= totalPlaySessions,
            "invalid session number"
        );
        require(
            newTotalPlayerWallets >= totalPlayerWallets,
            "invalid wallet number"
        );
        totalTwitterFollowers = newTotalTwitterFollowers;
        totalPlaySessions = newTotalPlaySessions;
        totalPlayerWallets = newTotalPlayerWallets;
        emit updatedMetrics(
            totalTwitterFollowers,
            totalPlaySessions,
            totalPlayerWallets
        );
    }
}
