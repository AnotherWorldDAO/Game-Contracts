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
    const walletAddresses = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => ([s.address, 500]));

    console.log(walletAddresses);
    const tree = StandardMerkleTree.of(walletAddresses, ["address", "uint256"]);
    console.log('Merkle Root:', tree.root);

    const MerkleDistributorContract = await ethers.getContractFactory('MerkleDistributor');
    const AnotherWorldGGContract = await ethers.getContractFactory("GGMock");
    
    const MerkleDistributor = await MerkleDistributorContract.deploy();
    console.log("\tGas(MerkleDistributor-deployment):\t", await getLastTxGas());

    const AnotherWorldGG = await AnotherWorldGGContract.deploy();
    console.log("\tGas(AnotherWorldGG-deployment):\t\t", await getLastTxGas());

    await AnotherWorldGG.deployed();

    await MerkleDistributor.connect(owner).updateRewardToken(AnotherWorldGG.address);

    await MerkleDistributor.connect(owner).updateMerkleRoot(tree.root);

    // Fixtures can return anything you consider useful for your tests
    return { AnotherWorldGGContract, AnotherWorldGG, owner, addr1, addr2, MerkleDistributor, tree, signer1, signer2, signer7, signer8 };
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

  describe('8 account tree', () => {
    it('successful and unsuccessful claim', async () => {
      const { AnotherWorldGG, MerkleDistributor, owner, addr1, addr2, signer1, signer2,  tree } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await AnotherWorldGG.transfer(MerkleDistributor.address, 5000);
      expect(await AnotherWorldGG.balanceOf(MerkleDistributor.address)).to.be.equal(5000);
      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(0);
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

      await MerkleDistributor.connect(signer1).claim(500, addressProof);
      console.log("\tGas(claim):\t", await getLastTxGas());

      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(500);

      expect(
        MerkleDistributor.connect(signer1).claim(500, addressProof)
        ).to.be.revertedWith(
          'already claimed'
        );

      expect(await AnotherWorldGG.balanceOf(signer1.address)).to.be.equal(500);

    })

  })
});