// run this under the repo root
//
// npx hardhat run scripts\deploy_sklGG.js --network nebula
//

const { ethers, network } = require("hardhat");

async function main() {
  const [deployer, operator] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  // check account balance
  console.log(
    "Deployer balance:",
    ethers.utils.formatEther(await deployer.getBalance())
  );
  console.log("");
  console.log("Operator:", operator.address);
  console.log(
    "Operator balance:",
    ethers.utils.formatEther(await operator.getBalance())
  );

  const GGContract = await ethers.getContractFactory("sklGG");
  const GG = await GGContract.deploy();
  await GG.deployed();

  console.log(`sklGG deployed to ${GG.address} on ${network.name}`);

  const GamePrizeContract = await ethers.getContractFactory("GamePrizeV2");
  const GamePrize = await GamePrizeContract.deploy();
  await GamePrize.deployed();
  console.log(`GamePrize deployed to ${GamePrize.address} on ${network.name}`);

  let tx;
  tx = await GG.connect(deployer).airdrop(
    GamePrize.address,
    ethers.utils.parseEther("10000.0")
  );
  await tx.wait();

  tx = await GamePrize.connect(deployer).setDripAmount(
    GG.address,
    ethers.utils.parseEther("200.0")
  );
  await tx.wait();

  console.log(
    `GG totalSupply ${ethers.utils.formatEther(await GG.totalSupply())}`
  );
  console.log(
    `GamePrize balanceOf GG ${ethers.utils.formatEther(
      await GG.balanceOf(GamePrize.address)
    )}`
  );
  console.log(
    `GamePrize GG dripAmount ${ethers.utils.formatEther(
      await GamePrize.dripAmount(GG.address)
    )}`
  );

  console.log("done!");
  console.log("Deployer:", deployer.address);
  // check account balance
  console.log(
    "Deployer balance:",
    ethers.utils.formatEther(await deployer.getBalance())
  );
  console.log("");
  console.log("Operator:", operator.address);
  console.log(
    "Operator balance:",
    ethers.utils.formatEther(await operator.getBalance())
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
