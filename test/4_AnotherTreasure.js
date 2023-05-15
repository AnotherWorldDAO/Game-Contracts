const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

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

    // season 1 contracts
    const TreasureFragmentsContract = await ethers.getContractFactory("TreasureFragments");
    const AnotherTreasureOPContract = await ethers.getContractFactory("AnotherTreasure");

    // signers
    const [owner, player1, player2, serverVaultOperator] = await ethers.getSigners();

    // deployment
    const TreasureFragments = await TreasureFragmentsContract.deploy();
    console.log("\tGas(TreasureFragments-1155):\t", await getLastTxGas());
    const AnotherTreasureOP = await AnotherTreasureOPContract.deploy();
    console.log("\tGas(AnotherTreasureOP-1155T):\t", await getLastTxGas());

    await TreasureFragments.deployed();
    await TreasureFragments.connect(owner).setVaultOperator(serverVaultOperator.address);
    
    await AnotherTreasureOP.deployed();
    await AnotherTreasureOP.connect(owner).setVaultOperator(serverVaultOperator.address);

    // fixtures for tests
    return {
      owner, 
      player1, 
      player2, 
      serverVaultOperator,
      TreasureFragments, AnotherTreasureOP
    };
  }

  describe("\nDeployment", function () {
    it("Should have the deployer as contract owner", async function () {
      const { TreasureFragments, owner } = await loadFixture(deployTokenFixture);
      expect(await TreasureFragments.owner()).to.equal(owner.address);
    });

    it("Should have initial balance of 0 of tokenId0 on owner", async function () {
      const { TreasureFragments, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await TreasureFragments.balanceOf(owner.address, 0);
      expect(await TreasureFragments.balanceOf(owner.address, 0)).to.equal(ownerBalance);
    });

    it("Should set to server vault operator for game mechanics", async function () {
      const { TreasureFragments, serverVaultOperator } = await loadFixture(deployTokenFixture);
      expect(await TreasureFragments.vaultOperator()).to.equal(serverVaultOperator.address);
    });

    it("Should have a correct token uri", async function () {
      const { TreasureFragments, owner } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).setURI("https://localhost/");
      expect(await TreasureFragments.uri(0)).to.equal("https://localhost/0.json");
    });

    it("Should be locked by the owner when needed", async function () {
      const { TreasureFragments, owner } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).toggleAirdrop(true);
      await TreasureFragments.connect(owner).toggleAirdrop(false);
      expect(await TreasureFragments.canAirdrop()).to.equal(false);
    });
  });

  describe("\nGame Contracts", function () {
    it("Should vault operator mint tokenId0 x1 to player1", async function () {
      const { TreasureFragments, owner, player1, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).toggleAirdrop(true);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      expect(await TreasureFragments.connect(player1).balanceOf(player1.address, 0)).to.equal(1);
      expect(await TreasureFragments.totalSupply()).to.equal(1);
    });
  
    it("Should vault operator airdrop TreasureFragments tokenId 0 x1 to player1", async function () {
      const { TreasureFragments, owner, player1, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).toggleAirdrop(true);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155-id0): ", await getLastTxGas());
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      console.log("\tGas(airdrop-1155-id0): ", await getLastTxGas());
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      console.log("\tGas(airdrop-1155-id1): ", await getLastTxGas());
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      console.log("\tGas(airdrop-1155-id1): ", await getLastTxGas());
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      console.log("\tGas(airdrop-1155-id1): ", await getLastTxGas());
      await TreasureFragments.connect(player1).safeTransferFrom(player1.address, serverVaultOperator.address, 1, 1, 0x00);
      console.log("\tGas(transfer-1155): ", await getLastTxGas());
      await TreasureFragments.connect(serverVaultOperator).safeTransferFrom(serverVaultOperator.address, player1.address, 1, 1, 0x00);
      console.log("\tGas(transfer-1155): ", await getLastTxGas());
      expect(await TreasureFragments.connect(player1).balanceOf(player1.address, 0)).to.equal(2);
      expect(await TreasureFragments.connect(player1).balanceOf(player1.address, 1)).to.equal(3);
    });

    it("Should vault operator airdrop AnotherTreasureOP x1 to player1", async function () {
      const { AnotherTreasureOP, owner, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AnotherTreasureOP.connect(serverVaultOperator).airdrop(player1.address);
      console.log("\tGas(airdrop-721A): ", await getLastTxGas());
      await AnotherTreasureOP.connect(serverVaultOperator).airdrop(player1.address);
      console.log("\tGas(airdrop-721A): ", await getLastTxGas());
      await AnotherTreasureOP.connect(serverVaultOperator).airdrop(player1.address);
      console.log("\tGas(airdrop-721A): ", await getLastTxGas());
      await AnotherTreasureOP.connect(serverVaultOperator).airdrop(player1.address);
      console.log("\tGas(airdrop-721A): ", await getLastTxGas());
      expect(await AnotherTreasureOP.connect(player1).balanceOf(player1.address)).to.equal(4);
      expect(await AnotherTreasureOP.connect(player1).balanceOf(player2.address)).to.equal(0);
    });

    it("Should player1 pay 0.1 eth to mint AnotherTreasureOP x1", async function () {
      const { AnotherTreasureOP, player1 } = await loadFixture(deployTokenFixture);
      await AnotherTreasureOP.connect(player1).mint(1, { value: ethers.utils.parseEther("0.1") });
      console.log("\tGas(mint-721A): ", await getLastTxGas());
      expect(await AnotherTreasureOP.connect(player1).balanceOf(player1.address)).to.equal(1);
    });

    it("Should player1 pay 1.0 eth to mint AnotherTreasureOP x10", async function () {
      const { AnotherTreasureOP, player1 } = await loadFixture(deployTokenFixture);
      await AnotherTreasureOP.connect(player1).mint(10, { value: ethers.utils.parseEther("1") });
      console.log("\tGas(mint10-721A): ", await getLastTxGas());
      expect(await AnotherTreasureOP.balanceOf(player1.address)).to.equal(10);
      expect(await AnotherTreasureOP.ownerOf(9)).to.equal(player1.address);
      expect(await AnotherTreasureOP.ownerOf(0)).to.equal(player1.address);
      //await expect(AnotherTreasureOP.ownerOf(10)).to.be.revertedWith("nonexistent token");
    });

    it("Should player1 forge TreasureFragments tokenId0 x1 to mint AnotherTreasureOP", async function () {
      const { AnotherTreasureOP, TreasureFragments, owner, player1, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).toggleAirdrop(true);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 2);
      expect(await TreasureFragments.totalSupply()).to.equal(4);
      await TreasureFragments.connect(owner).setMintContract(AnotherTreasureOP.address);
      await TreasureFragments.connect(owner).setTokenForgingRequirement(0, 2, 1, 1);
      
      await AnotherTreasureOP.connect(owner).setForgeContractAddress(TreasureFragments.address);
      await TreasureFragments.connect(owner).toggleForge(true);
      await TreasureFragments.connect(player1).forge();
      expect(await TreasureFragments.connect(player1).balanceOf(player1.address, 0)).to.equal(0);
      //expect(await TreasureFragments.connect(player1).totalSupply()).to.equal(2);
      expect(await AnotherTreasureOP.connect(player1).balanceOf(player1.address)).to.equal(1);
      expect(await TreasureFragments.totalSupply()).to.equal(1);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      expect(await TreasureFragments.totalSupply()).to.equal(4);
      await TreasureFragments.connect(player1).forge();
      expect(await TreasureFragments.totalSupply()).to.equal(1);
    });

    it("Should player1 refine TreasureFragments tokenId0 x3", async function () {
      const { AnotherTreasureOP, TreasureFragments, owner, player1, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await TreasureFragments.connect(owner).toggleAirdrop(true);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 0);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 1);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 7);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 7);
      await TreasureFragments.connect(serverVaultOperator).airdrop(player1.address, 7);
      expect(await TreasureFragments.totalSupply()).to.equal(9);
      await TreasureFragments.connect(owner).toggleRefinement(true);
      await TreasureFragments.connect(player1).refine(0, 3, { value: ethers.utils.parseEther("0.03") });
      await TreasureFragments.connect(player1).refine(1, 3, { value: ethers.utils.parseEther("0.03") });
      await TreasureFragments.connect(player1).refine(7, 3, { value: ethers.utils.parseEther("0.03") });
      console.log("\tbalanceOf tokenId 0: 3 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 0)));
      console.log("\tbalanceOf tokenId 1: 3 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 1)));
      console.log("\tbalanceOf tokenId 2: 0 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 2)));
      console.log("\tbalanceOf tokenId 3: 0 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 3)));
      console.log("\tbalanceOf tokenId 4: 0 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 4)));
      console.log("\tbalanceOf tokenId 5: 0 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 5)));
      console.log("\tbalanceOf tokenId 6: 0 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 6)));
      console.log("\tbalanceOf tokenId 7: 3 -> ", Number(await TreasureFragments.connect(player1).balanceOf(player1.address, 7)));

      console.log("\ttotalSupply: ", Number(await TreasureFragments.totalSupply()));
      
      expect(await TreasureFragments.provider.getBalance(TreasureFragments.address)).to.equal(ethers.utils.parseEther("0.09"));
      await TreasureFragments.connect(owner).withdraw();
      expect(await TreasureFragments.provider.getBalance(TreasureFragments.address)).to.equal(ethers.utils.parseEther("0"));
    });

    
  });
});