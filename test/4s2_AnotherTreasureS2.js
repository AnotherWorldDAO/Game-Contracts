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


describe("Another Treasure Contracts", function () {
  async function deployTokenFixture() {

    // season 2 contracts
    const AnotherTreasureContract = await ethers.getContractFactory("AnotherTreasureS2");

    // signers
    const [owner, player1, player2, serverVaultOperator] = await ethers.getSigners();

    // deployment
    const AnotherTreasure = await AnotherTreasureContract.deploy();
    console.log("\tGas(AnotherTreasure-1155):\t", await getLastTxGas());
    
    await AnotherTreasure.deployed();
    await AnotherTreasure.connect(owner).setVaultOperator(serverVaultOperator.address);

    // fixtures for tests
    return {
      owner, 
      player1, 
      player2, 
      serverVaultOperator,
      AnotherTreasure
    };
  }

  describe("\nDeployment", function () {
    it("Should have the deployer as contract owner", async function () {
      const { AnotherTreasure, owner } = await loadFixture(deployTokenFixture);
      expect(await AnotherTreasure.owner()).to.equal(owner.address);
    });

    it("Should have initial balance of 0 of tokenId0 on owner", async function () {
      const { AnotherTreasure, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await AnotherTreasure.balanceOf(owner.address, 0);
      expect(await AnotherTreasure.balanceOf(owner.address, 0)).to.equal(ownerBalance);
    });

    it("Should set to server vault operator for game mechanics", async function () {
      const { AnotherTreasure, serverVaultOperator } = await loadFixture(deployTokenFixture);
      expect(await AnotherTreasure.vaultOperator(serverVaultOperator.address)).to.equal(true);
    });

    it("Should have a correct token uri", async function () {
      const { AnotherTreasure, owner } = await loadFixture(deployTokenFixture);
      await AnotherTreasure.connect(owner).setURI("https://localhost/");
      expect(await AnotherTreasure.uri(0)).to.equal("https://localhost/0.json");
    });
  });


  describe("\nGame Contracts", function () {
    it("Should vault operator set game state 100 for player1", async function () {
      const { AnotherTreasure, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AnotherTreasure.connect(serverVaultOperator).setUserState(player1.address, 10);
      await AnotherTreasure.connect(serverVaultOperator).setUserState(player2.address, 10);
      await AnotherTreasure.connect(serverVaultOperator).setUserState(player1.address, 100);
      expect(await AnotherTreasure.connect(player1).userStates(player1.address)).to.equal(100);
      expect(await AnotherTreasure.connect(player2).userStates(player2.address)).to.equal(10);
    });

    it("Should vault operator airdrop AnotherTreasure x1 to player1", async function () {
      const { AnotherTreasure, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await expect(AnotherTreasure.connect(serverVaultOperator).airdrop(player1.address, 0)).to.be.revertedWith('invalid player');;
      await AnotherTreasure.connect(serverVaultOperator).setUserState(player1.address, 10);
      await AnotherTreasure.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155): ", await getLastTxGas());
      await AnotherTreasure.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155): ", await getLastTxGas());
      await AnotherTreasure.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155): ", await getLastTxGas());
      await AnotherTreasure.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155): ", await getLastTxGas());
      expect(await AnotherTreasure.connect(player1).balanceOf(player1.address, 0)).to.equal(4);
      expect(await AnotherTreasure.connect(player1).balanceOf(player2.address, 0)).to.equal(0);
    });
    
  });
});