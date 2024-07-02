// SPDX-License-Identifier: MIT
//
// AnotherTreasureS2.sol
//
// (Season 2) This is a treasure manager (on EVM custom chains) to mint/burn erc1155 items
// The game server owns vaultServerOperator wallet can airdrop/distroy.
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AnotherTreasureS2 is ERC1155, ERC1155Burnable, Ownable {
    event Airdrop(address, uint256, uint256);
    event Destroy(address, uint256);
    event Consume(address, uint256, uint256);
    event NewUri(string);
    event NewVaultOperator(address);
    event KO(address, address, uint256, uint256);

    // basic contract info
    string public name;
    string public symbol;
    string public baseUri;

    uint256 public userCount = 0;
    uint256 public battleStartTs = 0;
    uint256 public battleEndTs = 0;

    mapping(address => uint256) public userStates; // user states set by game
    mapping(address => uint256) public userTimestamps; // user timestamps set by game

    // vault operators are controlled by a game server
    mapping(address => bool) public vaultOperator;

    constructor() ERC1155("") {
        name = "AnotherTreasure";
        symbol = "TREASURE";
        baseUri = "https://anotherworld.gg/static/awtreasure/";
        vaultOperator[msg.sender] = true;
    }

    // owner can update metadata uri
    function setURI(string memory newuri) public onlyOwner {
        baseUri = newuri;
        emit NewUri(baseUri);
    }

    // owner can update vault operator
    function setVaultOperator(address newOperator) public onlyOwner {
        require(newOperator != address(0));
        vaultOperator[newOperator] = true;
        emit NewVaultOperator(newOperator);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(baseUri, Strings.toString(tokenId), ".json")
            );
    }

    function setBattleTime(uint256 start, uint256 end) external {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can set
        require(end > start, "invalid battle");
        battleStartTs = start;
        battleEndTs = end;
    }

    function airdrop(address account, uint256 id) external {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can airdrop
        require(userStates[account] > 0, "invalid player"); // do not allow non-player (no player state) to receive airdrop
        _mint(account, id, 1, "");
        emit Airdrop(account, id, 1);
    }

    function ko(
        address koAccount,
        address byAccount
    ) external returns (uint256) {
        require(koAccount != address(0), "invalid koAccount");
        require(byAccount != address(0), "invalid byAccount");
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can airdrop

        // ko account balance
        uint256 mintNum = balanceOf(koAccount, 1);

        // empty ko
        if (mintNum < 1) {
            return 0;
        }

        _mint(byAccount, 1, mintNum, "");

        if (mintNum > 0) {
            destroy(koAccount, 1);
        }

        emit KO(koAccount, byAccount, 1, mintNum);

        return mintNum;
    }

    function destroy(address account, uint256 id) public {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can destroy
        require(balanceOf(account, id) > 0, "nothing to destroy");
        burn(account, id, balanceOf(account, id));
        emit Destroy(account, id);
    }

    function consume(address account, uint256 id, uint256 amount) public {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can destroy
        require(balanceOf(account, id) >= amount, "nothing to consume");
        burn(account, id, amount);
        emit Consume(account, id, amount);
    }

    function setUserState(address userAddress, uint256 userState) public {
        require(vaultOperator[msg.sender], "invalid operator"); // only vaultOperator can update
        require(userState > 0, "invalid state");
        userStates[userAddress] = userState;
        userTimestamps[userAddress] = block.timestamp;
    }

    function random() internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender)
                )
            );
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public view override returns (bool isOperator) {
        // vaultServerOperator address can move minted 1155 tokens
        if (vaultOperator[_operator]) {
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}
