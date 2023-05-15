// SPDX-License-Identifier: MIT
//
// AnotherTreasure721A.sol
//
// This is a treasure vault (on OP mainnet) to manage erc1155 mint/transfer its 1155 items
// The game server owns vaultServerOperator wallet can mint in-game items to players.
//
// deployment: 2158900 gas
// mint: 
// burn:
// transfer: 
//

pragma solidity 0.8.17;

//import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/ERC721A.sol";

contract AnotherTreasure is ERC721A, Ownable {

    // receiving ETH from address
    event Received(address, uint256);

    // minted tokenId, amount to address
    event Minted(address, uint256, uint256);

    string public baseUri;
    uint256 public price = 0.1 ether;

    uint256 public currentIndex = 1;
    uint256 public constant maxSupply = 10;

    // vault operator is controlled by a game server
    address public vaultOperator;

    // owner can lock vault operations
    bool public operatorCanTransfer = true;

    address public forgeContractAddress; // can be forged from contract

    constructor() ERC721A("TestBox", "TB") {
        vaultOperator = msg.sender;
    }

    // update migration source contract address
    function setForgeContractAddress(address newAddress) external onlyOwner { 
        forgeContractAddress = newAddress;
    }

    // owner can update metadata uri
    function setURI(string memory newuri) public onlyOwner {
        baseUri = newuri;
    }

    // owner can update vault operator
    function setVaultOperator(address newOperator) public onlyOwner {
        vaultOperator = newOperator;
    }

    // owner can one-way unlock transfer
    function disableOperatorTransfer() external onlyOwner {
        operatorCanTransfer = false;
    }

    // owner can update price
    function setPrice(uint256 newPrice) external onlyOwner {
        price = newPrice;
    }

    // migration will trigger minting
    function mintTransfer(address to) public returns(uint256) {
        require(msg.sender == forgeContractAddress, "not authorized");
        uint256 _index = currentIndex;
        require(_index < maxSupply, "supply limit");

        _mint(to, 1);
        emit Minted(to, _index, 1); // +1k gas
        unchecked {
            _index++;
        }
        currentIndex = _index;
        return currentIndex - 1;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function mint(uint256 quantity)
        external payable
    {
        require(msg.value >= price * quantity, "not enough to buy");
        uint256 _index = currentIndex;
        require(_index + quantity - 1 <= maxSupply, "supply limit");

        _mint(msg.sender, quantity);
        emit Minted(msg.sender, _index, quantity); // +1k gas
        currentIndex = _index + quantity;
    }

    function airdrop(address account)
        public
    {
        require(msg.sender == vaultOperator, "invalid operator"); // only vaultServerOperator can mint
        require(operatorCanTransfer, "operator cannot transfer");
        uint256 _index = currentIndex;
        require(_index < maxSupply, "supply limit");

        _mint(account, 1);
        emit Minted(account, _index, 1); // +1k gas
        unchecked {
            _index++;
        }
        currentIndex = _index;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(baseUri, Strings.toString(tokenId), ".json"));
    }

    function withdraw() external payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }
    
    /*
    function onERC721Received(
        address, 
        address, 
        uint256, 
        bytes calldata
    )external override pure returns(bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }*/
}