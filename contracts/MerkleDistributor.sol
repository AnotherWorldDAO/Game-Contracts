// SPDX-License-Identifier: GPL-3.0-or-later
//
// MerkleDistributor.sol
//
// distribute ERC-20 tokens based on Merkle proofs
//

pragma solidity =0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor is Ownable {
    using SafeERC20 for IERC20;

    address public token;
    bytes32 public merkleRoot;

    mapping(address => bool) private addressesClaimed;

    event Claimed(address, uint256);
    event MerkleRootUpdated(address, bytes32);
    event RewardTokenUpdated(address, bytes32);

    constructor() {
    }

    function updateMerkleRoot(bytes32 merkleRoot_) external onlyOwner {
        merkleRoot = merkleRoot_;
        emit MerkleRootUpdated(token, merkleRoot);
    }

    function updateRewardToken(address token_) external onlyOwner {
        require(token_ != address(0), "invalid token_");
        token = token_;
        emit RewardTokenUpdated(token, merkleRoot);
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof)
        external
        virtual
    {
        require(!addressesClaimed[msg.sender], "already claimed");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "invalid proof");
        addressesClaimed[msg.sender] = true;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit Claimed(msg.sender, amount);
    }

    function withdraw() external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }
}
