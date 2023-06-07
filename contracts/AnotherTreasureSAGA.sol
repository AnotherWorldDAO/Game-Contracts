// SPDX-License-Identifier: MIT
//
// AnotherTreasureSAGA.sol
//
// This is a treasure manager (on SAGA) to mint/burn erc1155 items
// The game server owns vaultServerOperator wallet can airdrop/distroy.
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AnotherTreasureSAGA is ERC1155, ERC1155Burnable, Ownable {

    event Airdrop(address, uint256);
    event Destroy(address, uint256);
    event NewUri(string);
    event NewVaultOperator(address);

    // basic contract info
    string public name;
    string public symbol;
    string public baseUri;

    // vault operator is controlled by a game server
    address public vaultOperator;

    constructor() ERC1155("") {
        name = "AnotherTreasure";
        symbol = "TREASURE";
        vaultOperator = msg.sender;
    }

    // owner can update metadata uri
    function setURI(string memory newuri) public onlyOwner {
        baseUri = newuri;
        emit NewUri(baseUri);
    }

    // owner can update vault operator
    function setVaultOperator(address newOperator) public onlyOwner {
        require(newOperator != address(0));
        vaultOperator = newOperator;
        emit NewVaultOperator(vaultOperator);
    }

    function uri(uint256 tokenId) public override view returns (string memory) {
        return string(abi.encodePacked(baseUri, Strings.toString(tokenId), ".json"));
    }

    function airdrop(address account, uint256 id) external {
        require(msg.sender == vaultOperator, "invalid operator"); // only vaultOperator can airdrop
        _mint(account, id, 1, "");
        emit Airdrop(account, id);
    }

    function destroy(address account, uint256 id) external {
        require(msg.sender == vaultOperator, "invalid operator"); // only vaultOperator can destroy
        burn(account, id, balanceOf(account, id));
        emit Destroy(account, id);
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
       // vaultServerOperator address can move minted 1155 tokens
       if (_operator == vaultOperator) {
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}