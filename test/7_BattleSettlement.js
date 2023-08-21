const { expect } = require("chai");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("BattleSettlement contract", function () {
  async function deployTokenFixture() {
    const BattleSettlementContract = await ethers.getContractFactory(
      "BattleSettlementV2"
    );
    const [
      owner,
      serverVaultOperator,
      player1,
      player2,
      player3,
      player4,
      player5,
      player6,
    ] = await ethers.getSigners();
    const BattleSettlement = await BattleSettlementContract.deploy();

    await BattleSettlement.deployed();
    await BattleSettlement.connect(owner).setSettlementOperator(
      serverVaultOperator.address
    );
    await BattleSettlement.connect(serverVaultOperator).setBattle(
      Math.floor(Date.now() / 1000)
    );

    // Fixtures can return anything you consider useful for your tests
    return {
      BattleSettlementContract,
      BattleSettlement,
      owner,
      player1,
      player2,
      player3,
      player4,
      player5,
      player6,
      serverVaultOperator,
    };
  }

  describe("Deployment", function () {
    it("Should have the deployer as contract owner", async function () {
      const { BattleSettlement, owner } = await loadFixture(deployTokenFixture);
      expect(await BattleSettlement.owner()).to.equal(owner.address);
    });

    it("Should set to server vault operator for battle settlement", async function () {
      const { BattleSettlement, serverVaultOperator } = await loadFixture(
        deployTokenFixture
      );
      expect(
        await BattleSettlement.settlementOperator(serverVaultOperator.address)
      ).to.equal(true);
    });
  });

  describe("Snapshots & Settlement", function () {
    it("Should operator snapshot player states", async function () {
      const {
        BattleSettlement,
        player1,
        player2,
        player3,
        serverVaultOperator,
      } = await loadFixture(deployTokenFixture);
      await BattleSettlement.connect(serverVaultOperator).snapshot(
        [player1.address, player3.address, player2.address],
        [0, 1, 0],
        [3, 5, 4]
      );
      expect(await BattleSettlement.balance(player1.address, 0)).to.equal(3);
      expect(await BattleSettlement.balance(player2.address, 0)).to.equal(4);
      expect(await BattleSettlement.balance(player3.address, 1)).to.equal(5);
    });

    it("Should operator settle player states", async function () {
      const {
        BattleSettlement,
        player1,
        player2,
        player3,
        player4,
        serverVaultOperator,
      } = await loadFixture(deployTokenFixture);
      var tx = null;
      tx = await BattleSettlement.connect(serverVaultOperator).snapshot(
        [player1.address, player3.address, player2.address],
        [0, 1, 0],
        [3, 5, 4]
      );
      await tx.wait();
      tx = await BattleSettlement.connect(serverVaultOperator).snapshot(
        [player1.address, player3.address, player2.address, player4.address],
        [1, 0, 0, 0],
        [3, 2, 4, 1]
      );
      await tx.wait();

      const endTs = await BattleSettlement.endTs();

      // after tournament ends
      await time.increaseTo(Number(endTs) + 10);

      // snapshot after settlement does not count
      tx = await BattleSettlement.connect(serverVaultOperator).snapshot(
        [player1.address, player3.address, player2.address, player4.address],
        [1, 0, 0, 0],
        [9, 9, 9, 9]
      );
      await tx.wait();

      // call settled()
      const result = await BattleSettlement.connect(
        serverVaultOperator
      ).callStatic.settled();
      console.log(result);

      //tx = await BattleSettlement.connect(serverVaultOperator).settle();
      //await tx.wait();
      expect(await BattleSettlement.isSettled()).to.equal(true);
      expect(await BattleSettlement.balance(player1.address, 1)).to.equal(3);
      expect(await BattleSettlement.balance(player2.address, 0)).to.equal(4);
      expect(await BattleSettlement.balance(player3.address, 1)).to.equal(5);
      expect(await BattleSettlement.balance(player4.address, 0)).to.equal(1);

      const addressCounter = Number(await BattleSettlement.addressCounter());
      const itemCounter = Number(await BattleSettlement.itemCounter());

      console.log("addressCounter", addressCounter);
      console.log("itemCounter", itemCounter);

      // print settlement results
      for (let i = 0; i < result[0].length; i++) {
        const playerAddress = result[0][i];
        //console.log(playerAddress);
        for (let j = 0; j < result[1].length; j++) {
          const Playerbalance = await BattleSettlement.balance(
            playerAddress,
            j
          );
          console.log(
            playerAddress,
            ", itemId",
            Number(j),
            ", balance",
            Number(Playerbalance)
          );
        }
      }
    });
  });
});
