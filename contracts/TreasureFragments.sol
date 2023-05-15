// SPDX-License-Identifier: MIT
//
// TreasureFragments.sol
//
// @AnotherWorldDAO
//
// This is an ERC-1155 treasure fragment contract on OP mainnet to airdrop items
// The game server as vaultOperator can airdrop items to players (rate-limited).
// Players can refine treasure fragments for a fee (in order to fund airdrops).
// Treasure Fragments can be forged to mint another item (from another contract).
//

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract MintContractInterface {
    // target contract needs to implement mintTransfer function
    function mintTransfer(address to) public virtual returns (uint256);
}

contract TreasureFragments is ERC1155, ERC1155Burnable, Ownable {
    // airdrop (owner, tokenId)
    event Airdrop(address, uint256);

    // forge burn event - owner, tokenId1, amount1, tokenId2, amount2
    event Forge(address, uint256, uint256, uint256, uint256);

    // refinement events - owner, tokenId, amount
    event RefinementBurn(address, uint256, uint256);
    event RefinementMint(address, uint256, uint256);

    // basic contract info
    string public name;
    string public symbol;
    string public baseUri;

    // owner can lock vault operations
    bool public canAirdrop = false;

    // holders can forge tokens
    bool public canForge = false;

    // holders can refine tokens
    bool public canRefine = false;

    // vaultOperator can move tokens controlled by a game server
    address public vaultOperator;

    // owner should set forge contract address
    address public mintContractAddress;

    // owner should set forge requirements and which tokens can be forged
    uint256 public tokenId1Forgeable = 0; // enable this tokenId for forging
    uint256 public tokenId1RequiredToForge = 2; // need 2x token to forge
    uint256 public tokenId2Forgeable = 1; // enable this tokenId for forging
    uint256 public tokenId2RequiredToForge = 0; // need 1x token to forge

    // nonce for pseudo random function
    uint256 private nonce = 0;

    // refinement fee per item
    uint256 public refineFee = 0.01 ether;

    // current supply
    uint256 public totalSupply = 0;

    constructor() ERC1155("") {
        name = "TreasureFragments";
        symbol = "FRAG";
        vaultOperator = msg.sender;
    }

    // set authorized contract address for minting new tokens
    function setMintContract(address contractAddress) external onlyOwner {
        mintContractAddress = contractAddress;
    }

    // toggle forge
    function toggleForge(bool shallForge) external onlyOwner {
        canForge = shallForge;
    }

    // toggle refinement
    function toggleRefinement(bool shallRefine) external onlyOwner {
        canRefine = shallRefine;
    }

    // set forge requirements
    function setTokenForgingRequirement(
        uint256 newTokenId1Forgeable,
        uint256 newTokenId1RequiredToForge,
        uint256 newTokenId2Forgeable,
        uint256 newTokenId2RequiredToForge
    ) external onlyOwner {
        tokenId1Forgeable = newTokenId1Forgeable;
        tokenId1RequiredToForge = newTokenId1RequiredToForge;
        tokenId2Forgeable = newTokenId2Forgeable;
        tokenId2RequiredToForge = newTokenId2RequiredToForge;
    }

    function checkTokenForgingRequirement(
        address account
    ) public view returns (bool) {
        require(
            balanceOf(account, tokenId1Forgeable) >= tokenId1RequiredToForge,
            "not enough (1st item)"
        );
        require(
            balanceOf(account, tokenId2Forgeable) >= tokenId2RequiredToForge,
            "not enough (2nd item)"
        );
        return true;
    }

    function forge() external returns (uint256) {
        require(canForge, "forge not open");
        require(
            checkTokenForgingRequirement(msg.sender),
            "not enough to forge"
        ); // check forging requirement
        burn(msg.sender, tokenId1Forgeable, tokenId1RequiredToForge); // burn required token 1
        burn(msg.sender, tokenId2Forgeable, tokenId2RequiredToForge); // Burn required token 2
        MintContractInterface mintContract = MintContractInterface(
            mintContractAddress
        );
        uint256 mintedId = mintContract.mintTransfer(msg.sender); // mint new token from mintContractAddress
        emit Forge(
            msg.sender,
            tokenId1Forgeable,
            tokenId1RequiredToForge,
            tokenId2Forgeable,
            tokenId2RequiredToForge
        );

        unchecked {
            totalSupply =
                totalSupply -
                (tokenId1RequiredToForge + tokenId2RequiredToForge);
        }

        return mintedId; // Return the minted ID
    }

    function refine(uint256 tokenId, uint256 amount) external payable {
        require(canRefine, "refinement not open");
        require(amount > 0, "nothing to refine");
        require(
            balanceOf(msg.sender, tokenId) >= amount,
            "not enough to refine"
        ); // check refinement requirement
        require(
            msg.value >= refineFee * amount,
            "not enough to pay refinement"
        );

        if (random() % 1000 < 500) {
            // 50% chance
            burn(msg.sender, tokenId, amount); // fragments burned
            emit RefinementBurn(msg.sender, tokenId, amount);

            uint256 mintedId = random() % (tokenId + 1);
            _mint(msg.sender, mintedId, 1, ""); // refinement random mint
            emit RefinementMint(msg.sender, mintedId, 1);

            unchecked {
                totalSupply = totalSupply - amount + 1;
            }
        } else {
            _mint(msg.sender, tokenId, amount, ""); // refinement extra mints
            emit RefinementMint(msg.sender, tokenId, amount);

            unchecked {
                totalSupply += amount;
            }
        }

        if (random() % 1000 < 250) {
            // 25% chance
            uint256 mintedId = random() % (tokenId + 1);
            _mint(msg.sender, mintedId, 1, ""); // refinement bonus mint
            emit RefinementMint(msg.sender, mintedId, 1);

            unchecked {
                totalSupply++;
            }
        }

        if (random() % 1000 < 100) {
            // 10% chance
            uint256 mintedId = random() % (tokenId + 1);
            uint256 mintedAmount = random() % amount;
            _mint(msg.sender, mintedId, mintedAmount, ""); // refinement extra bonus mint
            emit RefinementMint(msg.sender, mintedId, mintedAmount);

            unchecked {
                totalSupply += mintedAmount;
            }
        }

        // need to manually set gas limit to 100k
    }

    // owner can update refineFee
    function setRefineFee(uint256 newFee) external onlyOwner {
        refineFee = newFee;
    }

    // owner can update metadata uri
    function setURI(string memory newuri) external onlyOwner {
        baseUri = newuri;
    }

    // owner can update vault operator
    function setVaultOperator(address newOperator) external onlyOwner {
        vaultOperator = newOperator;
    }

    // owner can lock vault operations
    function toggleAirdrop(bool shallAirdrop) external onlyOwner {
        canAirdrop = shallAirdrop;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return
            string(
                abi.encodePacked(baseUri, Strings.toString(tokenId), ".json")
            );
    }

    function airdrop(address account, uint256 id) external {
        require(canAirdrop, "airdrop disabled");
        require(msg.sender == vaultOperator, "invalid operator"); // only vaultOperator can airdrop
        _mint(account, id, 1, "");

        emit Airdrop(account, id);

        unchecked {
            totalSupply++;
        }
    }

    function random() internal returns (uint256) {
        unchecked {
            nonce++;
        }
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        nonce,
                        address(this).balance
                    )
                )
            );
    }

    function withdraw() external payable onlyOwner {
        require(payable(msg.sender).send(address(this).balance));
    }
}
