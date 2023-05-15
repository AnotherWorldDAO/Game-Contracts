const { config: dotenvConfig } = require("dotenv");
const { resolve } = require("path");
//require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
require("@nomicfoundation/hardhat-toolbox");
dotenvConfig({ path: resolve(__dirname, "./.env") });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    },
    goerliop: {
      url: `https://optimism-goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      //accounts:[`0x${process.env.AW_DEPLOYER}`]
    },
    awsaga: {
      url: `https://anotherworld-1681423864760549-1.jsonrpc.sp1.sagarpc.io`,
      //accounts:[`0x${process.env.AW_DEPLOYER}`, `0x${process.env.AW_OPERATOR}`]
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    //apiKey: process.env.ETHERSCANOP_API_KEY
  }
};
