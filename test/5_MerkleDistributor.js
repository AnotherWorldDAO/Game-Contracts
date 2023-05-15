const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

async function getLastTxGas(){
  // Get latest transaction hash
  const latestBlock = await ethers.provider.getBlock("latest");
  const latestTXHash = latestBlock.transactions.at(-1);
  // Get latest transaction receipt object
  const latestTXReceipt = await ethers.provider.getTransactionReceipt(
    latestTXHash
  );
  // Determine latest transaction gas costs
  const latestTXGasUsage = latestTXReceipt.gasUsed;
  const latestTXGasPrice = latestTXReceipt.effectiveGasPrice;
  const latestTXGasCosts = latestTXGasUsage.mul(latestTXGasPrice);
  return Number(latestTXGasUsage)
}

describe("Token contract", function () {
  async function deployTokenFixture() {

    const [owner, addr1, addr2, signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();

    // mock rewards
    const walletAddresses = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => ([s.address, 100]));

    console.log(walletAddresses);
    const tree = StandardMerkleTree.of(walletAddresses, ["address", "uint256"]);
    console.log('Merkle Root:', tree.root);

    const MerkleDistributorContract = await ethers.getContractFactory('MerkleDistributor');

    const AnotherWorldGGContract = await ethers.getContractFactory("GGMock");
    
    const MerkleDistributor = await MerkleDistributorContract.deploy();

    const AnotherWorldGG = await AnotherWorldGGContract.deploy();

    console.log("\tGas(AnotherWorldGG-deployment):\t", await getLastTxGas());

    await AnotherWorldGG.deployed();

    await MerkleDistributor.connect(owner).updateRewardToken(AnotherWorldGG.address);

    await MerkleDistributor.connect(owner).updateMerkleRoot(tree.root);

    // Fixtures can return anything you consider useful for your tests
    return { AnotherWorldGGContract, AnotherWorldGG, owner, addr1, addr2, MerkleDistributor, tree, signer1, signer2 };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { AnotherWorldGG, owner } = await loadFixture(deployTokenFixture);
      expect(await AnotherWorldGG.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { AnotherWorldGG, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await AnotherWorldGG.balanceOf(owner.address);
      expect(await AnotherWorldGG.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { AnotherWorldGG, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      await AnotherWorldGG.connect(owner).transfer(addr1.address, AnotherWorldGG.balanceOf(owner.address));
      console.log("\towner balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(owner.address)));
      console.log("\taddr1 balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(addr1.address)));
      console.log("\taddr2 balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(addr2.address)));

      console.log("\tFoundersAddress balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(await AnotherWorldGG._FoundersAddress())));
      console.log("\tOperationAddress balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(await AnotherWorldGG._OperationAddress())));
      console.log("\tDAOAddress balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(await AnotherWorldGG._DAOAddress())));
      console.log("\tEcosystemAddress balance:" + ethers.utils.formatEther(await AnotherWorldGG.balanceOf(await AnotherWorldGG._EcosystemAddress())));
    });

    it("Should emit Transfer events", async function () {
      const { AnotherWorldGG, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await expect(AnotherWorldGG.transfer(addr1.address, 50))
        .to.emit(AnotherWorldGG, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(AnotherWorldGG.connect(addr1).transfer(addr2.address, 50))
        .to.emit(AnotherWorldGG, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { AnotherWorldGG, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await AnotherWorldGG.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        AnotherWorldGG.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await AnotherWorldGG.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe('8 account tree', () => {
    it('successful and unsuccessful claim', async () => {
      const { AnotherWorldGG, MerkleDistributor, owner, addr1, addr2, signer1, signer2,  tree } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await AnotherWorldGG.transfer(MerkleDistributor.address, 500);

      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(0)
      let addressProof = null;
      for (const [i, v] of tree.entries()) {
        if (v[0] === signer1.address) {
          const proof = tree.getProof(i);
          //console.log('Value:', v);
          //console.log('Proof:', proof);
          addressProof = proof;
        }
      }
      //console.log("proof: ", addressProof);

      await MerkleDistributor.connect(signer1).claim(100, addressProof);
      console.log("\tGas(claim):\t", await getLastTxGas());

      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(100)

      expect(
        MerkleDistributor.connect(signer1).claim(addressProof)
        ).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )

      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(100)

    })

  })
});