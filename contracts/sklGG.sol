// SPDX-License-Identifier: MIT

//
// sklGG.sol
//
// score token

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract sklGG is ERC20, Ownable, ERC20Burnable {
    event SetTokenOperator(address, bool);
    event Airdrop(address, uint256);
    event Consume(address, uint256);

    uint256 public constant maxAirdrop = 10 ** 4 * 10 ** 18; // 10,000
    uint256 public constant maxSupply = 10 ** 6 * 10 ** 18; // 1,000,000

    mapping(address => bool) public tokenOperator;

    constructor() ERC20("sklGG", "sklGG") {
        tokenOperator[msg.sender] = true;
    }

    function airdrop(address to, uint256 amount) public {
        require(tokenOperator[msg.sender], "invalid operator");
        require(amount <= maxAirdrop, "invalid amount");
        require(amount + totalSupply() <= maxSupply, "exceeded maxSupply");
        _mint(to, amount);
        emit Airdrop(to, amount);
    }

    function consume(address at, uint256 amount) public {
        require(tokenOperator[msg.sender], "invalid operator");
        require(amount <= maxAirdrop, "invalid amount");
        //transferFrom(at, address(this), amount);
        //burn(amount);
        burnFrom(at, amount);
        emit Consume(at, amount);
    }

    function setTokenOperator(
        address newOperator,
        bool canOperate
    ) public onlyOwner {
        require(newOperator != address(0));
        tokenOperator[newOperator] = canOperate;
        emit SetTokenOperator(newOperator, canOperate);
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual override {
        if (!tokenOperator[spender]) {
            uint256 currentAllowance = allowance(owner, spender);
            if (currentAllowance != type(uint256).max) {
                require(
                    currentAllowance >= amount,
                    "ERC20: insufficient allowance"
                );
                unchecked {
                    _approve(owner, spender, amount);
                }
            }
        }
    }
}
