const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("LedgerOfUserRecords contract", function () {
  async function deployTokenFixture() {
    const AWLedgerOfUserRecordsContract = await ethers.getContractFactory("LedgerOfUserRecords");
    const [owner, player1, player2, serverVaultOperator] = await ethers.getSigners();

    const AWUserRecord = await AWLedgerOfUserRecordsContract.deploy();

    await AWUserRecord.deployed();
    await AWUserRecord.connect(owner).setLedgerOperator(serverVaultOperator.address);

    // Fixtures can return anything you consider useful for your tests
    return { AWLedgerOfUserRecordsContract, AWUserRecord, owner, player1, player2, serverVaultOperator };
  }

  describe("Deployment", function () {
    it("Should have the deployer as contract owner", async function () {
      const { AWUserRecord, owner } = await loadFixture(deployTokenFixture);
      expect(await AWUserRecord.owner()).to.equal(owner.address);
    });

    it("Should set to server vault operator for game mechanics", async function () {
      const { AWUserRecord, serverVaultOperator } = await loadFixture(deployTokenFixture);
      expect(await AWUserRecord.ledgerOperator()).to.equal(serverVaultOperator.address);
    });
  });

  describe("Game Mechanics", function () {
    it("Should vault operator set game state 100 for player1", async function () {
      const { AWUserRecord, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player1.address, 10);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player1.address, 100);
      expect(await AWUserRecord.connect(player1).userStates(player1.address)).to.equal(100);
    });

    it("Should vault operator set admin game state 1000 for player2", async function () {
      const { AWUserRecord, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player1.address, 100);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player2.address, 100);
      await AWUserRecord.connect(serverVaultOperator).setUserAdminState(player2.address, 1000);
      expect(await AWUserRecord.connect(player2).userAdminStates(player2.address)).to.equal(1000);
    });

    it("Should have correct user counts", async function () {
      const { AWUserRecord, player1, player2, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player1.address, 100);
      await AWUserRecord.connect(serverVaultOperator).setUserState(player2.address, 100);
      expect(await AWUserRecord.connect(player1).userCount()).to.equal(2);
    });
  });
});