// SPDX-License-Identifier: MIT
//
// BattleSettlementV2.sol
//
// Another World's onchain settlement for season 1 battles (one contract per battle). This is one time use contract and meant for being deployed on extremely cheap gas public chain (for public verification)
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BattleSettlementV2 is Ownable {
    event Snapshot(address[], uint256[], uint256[]);
    event Settle(address[], uint256[]);
    event StartEndTime(uint256, uint256);
    event NewSettlementOperator(address);
    event TreasureContract(address);

    string public name = "BattleSettlement";
    string public symbol = "BS";
    string public treasureNetwork = "";
    string public notes =
        "This contract does snapshots and settle player's token balance onchain.";

    address public treasureContract;

    mapping(address => bool) public settlementOperator;

    bool public isSettled = false;

    uint256 public startTs = 0;
    uint256 public endTs = 0;
    uint256 public constant duration = 10 minutes;

    // player balances with item ids
    mapping(address => mapping(uint256 => uint256)) public balance;

    // readable item names
    mapping(uint256 => string) public itemNames;

    // address utils
    address[] public addresses;
    mapping(address => bool) private addressUsed;
    uint256 public addressCounter = 0;

    // item id utils
    uint256[] public itemIds;
    mapping(uint256 => bool) private itemIdUsed;
    uint256 public itemCounter = 0;

    constructor() {
        settlementOperator[msg.sender] = true; // default operator
    }

    function setTreasureContract(address newTreasureContract) public {
        require(settlementOperator[msg.sender], "invalid operator"); // only settlementOperator can update treasure contract
        require(newTreasureContract != address(0));
        treasureContract = newTreasureContract;
        emit TreasureContract(newTreasureContract);
    }

    function setTreasureNetwork(string calldata newTreasureNetwork) public onlyOwner {
        treasureNetwork = newTreasureNetwork;
    }

    function setItemName(uint256 id, string calldata itemName) public {
        require(settlementOperator[msg.sender], "invalid operator"); // only settlementOperator can set item names
        itemNames[id] = itemName;
    }

    // owner can update vault operator
    function setSettlementOperator(
        address newSettlementOperator
    ) public onlyOwner {
        require(newSettlementOperator != address(0));
        settlementOperator[newSettlementOperator] = true;
        emit NewSettlementOperator(newSettlementOperator);
    }

    // operator setup battle
    function setBattle(uint256 startTime) public {
        require(settlementOperator[msg.sender], "invalid operator"); // only settlementOperator can settle
        startTs = startTime;
        endTs = startTs + duration;
        emit StartEndTime(startTime, endTs);
    }

    // settle all player addresses (everyone can call settle() after end time)
    function settled()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        require(startTs > 0, "invalid start time");
        require(block.timestamp > endTs, "cannot settle before it ends");
        require(isSettled, "not settled");
        return (addresses, itemIds);
    }

    // snapshot players' balances in this contract (operator only)
    function snapshot(
        address[] calldata playerAddresses,
        uint256[] calldata playerItemIds,
        uint256[] calldata itemBalances
    ) public {
        require(!isSettled, "cannot snapshot after settlement");
        require(settlementOperator[msg.sender], "invalid operator"); // only settlementOperator can snapshot
        require(startTs > 0, "invalid start time");
        require(block.timestamp > startTs, "cannot snapshot before it starts");

        if (block.timestamp > endTs) {
            isSettled = true;
            emit Settle(addresses, itemIds);
        } else {
            for (uint256 i = 0; i < playerAddresses.length; i++) {
                balance[playerAddresses[i]][playerItemIds[i]] = itemBalances[i];
                if (!addressUsed[playerAddresses[i]]) {
                    addressUsed[playerAddresses[i]] = true;
                    addresses.push(playerAddresses[i]);
                    addressCounter++;
                }

                if (!itemIdUsed[playerItemIds[i]]) {
                    itemIdUsed[playerItemIds[i]] = true;
                    itemIds.push(playerItemIds[i]);
                    itemCounter++;
                }
            }
            emit Snapshot(playerAddresses, playerItemIds, itemBalances);
        }
    }
}
