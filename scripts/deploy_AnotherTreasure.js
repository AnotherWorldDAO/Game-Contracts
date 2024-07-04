// run this under the repo root
//
// npx hardhat run scripts\deploy_AnotherTreasure.js --network nebula
//

const { ethers, network } = require("hardhat");

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

async function main() {
  const [deployer, operator] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);

  console.log("Operator:", operator.address);

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

  // load contract
  const AnotherTreasureContract = await ethers.getContractFactory(
    "AnotherTreasureS2"
  );

  // deloy contract
  const AnotherTreasure = await AnotherTreasureContract.deploy();

  await AnotherTreasure.deployed();
  // console.log("Gas(Deployment-1155):\t", await getLastTxGas());

  console.log(
    `Contract deployed to ${AnotherTreasure.address} on ${network.name}`
  );

  console.log("done!");
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
