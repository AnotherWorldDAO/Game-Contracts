const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { utils, BigNumber } = require("ethers");
const fs = require("fs");

async function getLastTxGas() {
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
  return Number(latestTXGasUsage);
}

describe("Token contract", function () {
  async function deployTokenFixture() {
    const GGContract = await ethers.getContractFactory("sklGG");
    const [deployer, operator, player1, player2] = await ethers.getSigners();
    let tx;

    const GG = await GGContract.deploy();
    await GG.deployed();
    console.log("\tGas(GG-deployment):\t", await getLastTxGas(), GG.address);

    // Fixtures can return anything you consider useful for your tests
    return { GG, deployer, operator, player1, player2 };
  }

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { GG, deployer } = await loadFixture(deployTokenFixture);
      expect(await GG.owner()).to.equal(deployer.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { GG, deployer } = await loadFixture(deployTokenFixture);
      const ownerBalance = await GG.balanceOf(deployer.address);
      console.log(
        "(GG-Balance):\t",
        deployer.address,
        "owns",
        utils.formatEther(ownerBalance),
        "GG"
      );
      expect(await GG.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should emit Transfer events", async function () {
      const { GG, deployer, player1, player2 } = await loadFixture(
        deployTokenFixture
      );

      await GG.connect(deployer).airdrop(
        deployer.address,
        utils.parseEther("1000")
      );

      // Transfer 50 tokens from owner to player1
      await expect(GG.transfer(player1.address, utils.parseEther("50")))
        .to.emit(GG, "Transfer")
        .withArgs(deployer.address, player1.address, utils.parseEther("50"));

      // Transfer 50 tokens from player1 to player2
      // We use .connect(signer) to send a transaction from another account
      await expect(
        GG.connect(player1).transfer(player2.address, utils.parseEther("50"))
      )
        .to.emit(GG, "Transfer")
        .withArgs(player1.address, player2.address, utils.parseEther("50"));
    });

    it("Should operator return players' tokens", async function () {
      const { GG, deployer, player1, player2 } = await loadFixture(
        deployTokenFixture
      );

      await GG.connect(deployer).airdrop(
        player1.address,
        utils.parseEther("1000")
      );
      // Owner balance shouldn't have changed.
      expect(await GG.balanceOf(player1.address)).to.equal(
        utils.parseEther("1000")
      );

      await GG.connect(deployer).consume(
        player1.address,
        utils.parseEther("10")
      );

      expect(await GG.balanceOf(player1.address)).to.equal(
        utils.parseEther("990")
      );

      await GG.connect(deployer).setTokenOperator(player1.address, true);

      await GG.connect(player1).consume(
        player1.address,
        utils.parseEther("10")
      );

      expect(await GG.balanceOf(player1.address)).to.equal(
        utils.parseEther("980")
      );

      //expect(await GG.balanceOf(GG.address)).to.equal(utils.parseEther("20"));
      expect(await GG.totalSupply()).to.equal(utils.parseEther("980"));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { GG, deployer, player1 } = await loadFixture(deployTokenFixture);
      const initialOwnerBalance = await GG.balanceOf(deployer.address);

      // Try to send 1 token from player1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        GG.connect(player1).transfer(deployer.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await GG.balanceOf(deployer.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
