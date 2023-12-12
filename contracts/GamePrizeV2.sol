// SPDX-License-Identifier: MIT
//
// GamePrizeV2.sol
//
// v2: can drip custom amount and add more operators for higher throughput
// v1: Players who triggerred in-game events will receive airdrop/drip prizes.
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BaseErc20 {
    function balanceOf(address account) public virtual returns (uint256);
    function transfer(address recipient, uint256 amount) public virtual;
}

contract GamePrizeV2 is Ownable {
    event Received(address, uint);
    event Drip(address, address, uint256);
    event UpdateVaultOperator(address, bool);
    event NewDripAmount(address, uint256);
    event OwnerWithdrawErc20(address, address, uint256);

    BaseErc20 private token20;

    mapping(address => bool) public vaultOperator;
    mapping(address => uint256) public dripAmount; // user states set by game

    constructor() {
        vaultOperator[msg.sender] = true;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // owner can add vault operator
    function setVaultOperator(address newOperator, bool willOperate) public onlyOwner {
        require(newOperator != address(0));
        vaultOperator[newOperator] = willOperate;
        emit UpdateVaultOperator(newOperator, willOperate);
    }

    function setDripAmount(
        address erc20Address,
        uint256 newDripAmount
    ) public onlyOwner {
        dripAmount[erc20Address] = newDripAmount;
        emit NewDripAmount(erc20Address, dripAmount[erc20Address]);
    }

    function drip(address erc20Address, address to, uint256 amount) external {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can airdrop
        require(amount <= dripAmount[erc20Address]);
        token20 = BaseErc20(erc20Address); // erc-20 address
        token20.transfer(to, amount);
        emit Drip(erc20Address, to, amount);
    }

    function withdrawErc20(address erc20Address) external onlyOwner {
        require(erc20Address != address(0), "invalid erc20 address");
        token20 = BaseErc20(erc20Address);
        require(token20.balanceOf(address(this)) > 0, "already empty");
        uint256 withdrawAmount = token20.balanceOf(address(this));
        token20.transfer(msg.sender, withdrawAmount);
        emit OwnerWithdrawErc20(msg.sender, erc20Address, withdrawAmount);
    }

    function withdraw() external payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }
}
