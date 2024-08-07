# Game Contracts in Another World
A digital world needs a digital economy. These Solidity smart contracts provide on-chain game utilities in [Another World](https://anotherworld.gg):


- `TreasureFragments.sol` ([deployed on Optimism](https://optimistic.etherscan.io/address/0x56edafc97279c53a74c1c105abeebc79e0936c73), [OpenSea](https://opensea.io/collection/treasurefragments), [audited](https://github.com/AnotherWorldDAO/Game-Contracts/blob/21afd876d3ef30fec44120a9f140f296675f89fd/audits/AnotherWorldEtherAuthorityAuditReport.pdf)) - Treasure Fragments collection is Another World's official NFT (ERC-1155) collection on Optimism. Players _may_ receive airdrops from this collection when they acquire items in the game.

- `GamePrizeV2.sol` (deployed on Optimism [(active)](https://optimistic.etherscan.io/address/0x5556b094288a9e711eb579c75e0f5e6eeb5f551b), deployed on ETH [(active)](https://etherscan.io/address/0x496e83e7a74561c26d5151c0fce2cc400e884e49)) These contracts drips ERC-20 tokens ($OP and $APE) during the gameplay. Check this Unreal Engine [sample project](https://github.com/AnotherWorldDAO/ue5-treasurehunt) for smart contract and back-end integration.

- `BattleSettlementV2.sol` A series of battle settlement contracts deployed for [S1](https://anotherworld.gg/s1battles) and [ThankApe](https://anotherworld.gg/apebattles) Treasure Hunting battles.

- `AnotherTreasureV3.sol` (will be deployed right before each battle) - This contract manages in-game NFT item airdrops and burns. This contract includes `LedgerOfUserRecords.sol` (retired) to keep records of user states from the game operator. This contract will be deployed to Another World's custom EVM chains such as SAGA chainlet, AltLayer FlashLayer, or Conduit OP Stacks.

- `AnotherTreasureS2.sol` ([deployed on SKALE testnet](https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com/address/0x9863f84b9D53997Da00764eae0329F4864a4156D)) - This contract (testnet) manages Season 2 game states and airdrops/burns on SKALE.
  
- `sklGG.sol` ([deployed on SKALE testnet](https://lanky-ill-funny-testnet.explorer.testnet.skalenodes.com/address/0x9DE5B0CF9C58C3254637Bc031f594FD32DC1Bb7A)) - This contract (testnet) manages Season 2 game scores on SKALE.

- `MerkleDistributor.sol` ([audited](https://github.com/AnotherWorldDAO/Game-Contracts/blob/21afd876d3ef30fec44120a9f140f296675f89fd/audits/AnotherWorldEtherAuthorityAuditReport.pdf))- This contract will be used for distributing ERC-20 tokens as rewards. Pre-season reward claiming contract is [deployed on Optimism](https://optimistic.etherscan.io/address/0x85e1c463d154a436da0d6437cc652283762f108b).

- `AnotherWorldMetricsV2.sol` ([deployed on Gnosis](https://gnosisscan.io/address/0x4ba56d8c902cabba8afc187d1d5f6e2e62468416)) - This contract is to place off-chain metrics such as "Twitter followers" on a low-gas fee chain (such as Gnosis Chain), so that the Dune Analytics is able to index and populate related metrics on Another World's Dune [dashboard](https://dune.com/jackieleeeth/anotherworld).

## Quick Start
installation
`yarn`

run tests
`npx hardhat test`
