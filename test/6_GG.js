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

    const GGContract = await ethers.getContractFactory("GGMock");
    const [owner, addr1, addr2] = await ethers.getSigners();

    
    const AnotherWorldGG = await GGContract.deploy();

    console.log("\tGas(AnotherWorldGG-deployment):\t", await getLastTxGas());

    await AnotherWorldGG.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { GGContract, AnotherWorldGG, owner, addr1, addr2 };
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
      // Transfer 50 tokens from owner to addr1
      //await expect(
        //await AnotherWorldGG.connect(owner).transfer(addr1.address, ethers.utils.parseUnits('200000', 18));
        await AnotherWorldGG.connect(owner).transfer(addr1.address, AnotherWorldGG.balanceOf(owner.address));
      //).to.changeTokenBalances(AnotherWorldGG, [owner, addr1], [-500000000000, 500000000000]);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      //await expect(
      //  AnotherWorldGG.connect(addr1).transfer(addr2.address, 500000000000)
      //).to.changeTokenBalances(AnotherWorldGG, [addr1, addr2], [-500000000000, 500000000000]);

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
});