// SPDX-License-Identifier: MIT
//
// GGMock.sol
//
// a mock contract for ERC-20 prize tokens that is subjected to be updated
//

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GGMock is ERC20, Ownable {

    // royalty destination to multi-sig safe addresses
    address public _FoundersAddress;
    address public _OperationAddress;
    address public _DAOAddress;
    address public _EcosystemAddress;

    // royalty fee structure 1000/1000
    uint256 public _DAORoyalty = 400; // for co-creating with community
    uint256 public _OperationRoyalty = 300; // for keeping Another World operational
    uint256 public _EcosystemRoyalty = 200; // for sharing royalty with NFT holders
    uint256 public _FoundersRoyalty = 100; // for founders

    uint256 public _RoyaltyOnTransfer = 420; // 420/100000: 0.42%

    mapping(address => bool) public addressBannedList; // addresses banned for participation


    constructor() ERC20("GGMock", "GGMock") {
        mockAddresses();
        _mint(msg.sender, 10 ** 9 * 10 ** 18);
    }

    function mockAddresses() public onlyOwner {
        // mock accounts from HH
        _FoundersAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // #1
        _OperationAddress = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // #2
        _DAOAddress = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // #3
        _EcosystemAddress = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65; // #4
    }

    function updateFoundersAddress(address newFoundersAddress) public {
        require( msg.sender == _FoundersAddress, "only _FoundersAddress can update address" );
        _FoundersAddress = newFoundersAddress;
    }

    function updateOperationAddress(address newOperationAddress) public {
        require( msg.sender == newOperationAddress, "only _OperationAddress can update address" );
        _OperationAddress = newOperationAddress;
    }

    function updateDAOAddress(address newDAOAddress) public {
        require( msg.sender == _DAOAddress, "only _DAOAddress can update address" );
        _DAOAddress = newDAOAddress;
    }

    function updateEcosystemAddress(address newEcosystemAddress) public {
        require( msg.sender == _EcosystemAddress, "only _EcosystemAddress can update address" );
        _EcosystemAddress = newEcosystemAddress;
    }

    // for in-game moderation, _OperationAddress can ban address
    function ban(address ethAddress) public {
        require( msg.sender == _OperationAddress, "_OperationAddress can ban address" );
        addressBannedList[ethAddress] = true;
    }

    // for in-game moderation, _DAOAddress can un-ban address
    function unban(address ethAddress) public {
        require( msg.sender == _DAOAddress, "_DAOAddress can un-ban address" );
        addressBannedList[ethAddress] = false;
    }

    // public view function to check if address is banned
    function isBanned(address ethAddress) public view returns (bool) {
        return addressBannedList[ethAddress];
    }

    function setRoyalty(uint256 newRoyaltyOnTransfer) public {
        require( msg.sender == _DAOAddress, "only _DAOAddress can update royalty" );
        _RoyaltyOnTransfer = newRoyaltyOnTransfer;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual override {
        require( !isBanned(sender), "sender is banned" );
        require( !isBanned(recipient), "recipient is banned" );

        // royalty fee for every transfer
        uint256 _FoundersRoyaltyAmount = (amount/100000000) * _RoyaltyOnTransfer * _FoundersRoyalty;
        uint256 _OperationRoyaltyAmount = (amount/100000000) * _RoyaltyOnTransfer * _OperationRoyalty;
        uint256 _DAORoyaltyAmount = (amount/100000000) * _RoyaltyOnTransfer * _DAORoyalty;
        uint256 _EcosystemRoyaltyAmount = (amount/100000000) * _RoyaltyOnTransfer * _EcosystemRoyalty;

        super._transfer(sender, _FoundersAddress, _FoundersRoyaltyAmount);
        super._transfer(sender, _OperationAddress, _OperationRoyaltyAmount);
        super._transfer(sender, _DAOAddress, _DAORoyaltyAmount);
        super._transfer(sender, _EcosystemAddress, _EcosystemRoyaltyAmount);
        super._transfer(sender, recipient, amount - _FoundersRoyaltyAmount - _OperationRoyaltyAmount - _DAORoyaltyAmount - _EcosystemRoyaltyAmount);
    }
}