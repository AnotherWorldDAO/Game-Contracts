const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("LedgerOfUserRecords contract", function () {
  async function deployTokenFixture() {
    const AnotherWorldMetricsContract = await ethers.getContractFactory("AnotherWorldMetrics");
    const [owner, player1, player2, serverVaultOperator] = await ethers.getSigners();

    const AnotherWorldMetrics = await AnotherWorldMetricsContract.deploy();

    await AnotherWorldMetrics.deployed();
    await AnotherWorldMetrics.connect(owner).setMetricsOperator(serverVaultOperator.address);

    // Fixtures can return anything you consider useful for your tests
    return { AnotherWorldMetricsContract, AnotherWorldMetrics, owner, player1, player2, serverVaultOperator };
  }

  describe("Deployment", function () {
    it("Should have the deployer as contract owner", async function () {
      const { AnotherWorldMetrics, owner } = await loadFixture(deployTokenFixture);
      expect(await AnotherWorldMetrics.owner()).to.equal(owner.address);
    });

    it("Should set to server vault operator for game mechanics", async function () {
      const { AnotherWorldMetrics, serverVaultOperator } = await loadFixture(deployTokenFixture);
      expect(await AnotherWorldMetrics.metricsOperator()).to.equal(serverVaultOperator.address);
    });

    it("Should have correct public twitterHandle as AnotherWorldDAO", async function () {
      const { AnotherWorldMetrics, serverVaultOperator } = await loadFixture(deployTokenFixture);
      expect(await AnotherWorldMetrics.twitterHandle()).to.equal("AnotherWorldDAO");
    });
  });

  describe("Set Public Records", function () {
    it("Should operator set totalPlaySessions as 2000 and totalTwitterFollowers as 500", async function () {
      const { AnotherWorldMetrics, player1, serverVaultOperator } = await loadFixture(deployTokenFixture);
      await AnotherWorldMetrics.connect(serverVaultOperator).setMetrics(500, 2000);
      expect(await AnotherWorldMetrics.connect(player1).totalPlaySessions()).to.equal(2000);
      expect(await AnotherWorldMetrics.connect(player1).totalTwitterFollowers()).to.equal(500);
    });
  });
});