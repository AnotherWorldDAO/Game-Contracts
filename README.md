# Game Contracts in Another World
A digital world needs a digital economy. These Solidity smart contracts provide on-chain game utilities in [Another World](https://anotherworld.gg):


- `TreasureFragments.sol` ([deployed on Optimism](https://optimistic.etherscan.io/address/0x56edafc97279c53a74c1c105abeebc79e0936c73), [OpenSea](https://opensea.io/collection/treasurefragments), [audited](https://github.com/AnotherWorldDAO/Game-Contracts/blob/21afd876d3ef30fec44120a9f140f296675f89fd/audits/AnotherWorldEtherAuthorityAuditReport.pdf)) - Treasure Fragments collection is Another World's official NFT (ERC-1155) collection on Optimism. Players _may_ receive airdrops from this collection when they acquire items in the game.

- `GamePrize.sol` ([deployed on Optimism](https://optimistic.etherscan.io/address/0x0b69157f85fb767676428f0d32866ee2b53ffcc6), [deployed on ETH](https://etherscan.io/address/0x496e83e7a74561c26d5151c0fce2cc400e884e49)) These contracts drips ERC-20 tokens ($OP and $APE) during the gameplay. Check this Unreal Engine [sample project](https://github.com/AnotherWorldDAO/ue5-treasurehunt).

- `BattleSettlementV2.sol` A series of battle settlement contracts deployed for [S1](https://anotherworld.gg/s1battles) and [ThankApe](https://anotherworld.gg/apebattles) Treasure Hunting battles.

- `AnotherTreasureV3.sol` (will be deployed right before each battle) - This contract manages in-game NFT item airdrops and burns. This contract includes `LedgerOfUserRecords.sol` (retired) to keep records of user states from the game operator. This contract will be deployed to Another World's custom EVM chains such as SAGA chainlet, AltLayer FlashLayer, or Conduit OP Stacks.

- `MerkleDistributor.sol` ([audited](https://github.com/AnotherWorldDAO/Game-Contracts/blob/21afd876d3ef30fec44120a9f140f296675f89fd/audits/AnotherWorldEtherAuthorityAuditReport.pdf))- This contract will be used for distributing ERC-20 tokens as rewards. Pre-season reward claiming contract is [deployed on Optimism](https://optimistic.etherscan.io/address/0x85e1c463d154a436da0d6437cc652283762f108b). Season 1 reward claiming contract will be deployed after review.

- `AnotherWorldMetricsV2.sol` ([deployed on Gnosis](https://gnosisscan.io/address/0x4ba56d8c902cabba8afc187d1d5f6e2e62468416)) - This contract is to place off-chain metrics such as "Twitter followers" on a low-gas fee chain (such as Gnosis Chain), so that the Dune Analytics is able to index and populate related metrics on Another World's Dune [dashboard](https://dune.com/jackieleeeth/anotherworld).

- `AnotherTreasureMock.sol` - This is a mock ERC-721 collection for forging Treasure Fragments into unique tokens on Optimism. TBD deployment date.

- `GGMock.sol` - This is a mock ERC-20 token contract for distribution Another World's scores $GG in the future. TBD deployment date.

- `AnotherTreasureSAGA.sol` (retired) - This contract manages in-game NFT item airdrops and burns. This contract is deployed on Another World's SAGA chainlet.

- `LedgerOfUserRecords.sol` (retired) - This contract is making per-user game state updates constantly from the game operator (i.e., a game server holds the operator wallet). This contract is deployed on extremely low gas fee chains like SAGA, AltLayer, or custom OP stack rollup chains.

## Quick Start
installation
`yarn`

run tests
`npx hardhat test`
