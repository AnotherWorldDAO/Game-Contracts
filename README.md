# Game Contracts in Another World
A digital world needs a digital economy. These Solidity smart contracts provide on-chain game utilities in [Another World](https://anotherworld.gg):


- `TreasureFragments.sol` ([deployed on Optimism](https://optimistic.etherscan.io/address/0x56edafc97279c53a74c1c105abeebc79e0936c73), [OpenSea](https://opensea.io/collection/treasurefragments)) - Treasure Fragments collection is Another World's official NFT (ERC-1155) collection on Optimism. Players _may_ receive airdrops from this collection when they acquire items in the game.

- `AnotherTreasureMock.sol` - This is a mock ERC-721 collection for forging Treasure Fragments into unique tokens on Optimism. TBD deployment date.

- `GGMock.sol` - This is a mock ERC-20 token contract for distribution Another World's scores $GG in the future. TBD deployment date.

- `MerkleDistributor.sol` - This contract will be used for distributing ERC-20 tokens as rewards. To be deployed in July.

- `LedgerOfUserRecords.sol` ([deployed on SAGA](http://anotherworld-1681423864760549-1.sp1.sagaexplorer.io/address/0x7e8Ab2f3F61BEBB425712551Ffa9836bC7D4a92D)) - This contract is making per-user game state updates constantly from the game operator (i.e., a game server holds the operator wallet). This contract is deployed on extremely low gas fee chains like SAGA, AltLayer, or custom OP stack rollup chains.

- `AnotherWorldMetrics.sol` ([deployed on Gnosis](https://gnosisscan.io/address/0x1160982721af95351a714a483275229cca10ee54)) - This contract is to place off-chain metrics such as "Twitter followers" on a low-gas fee chain (such as Gnosis Chain), so that the Dune Analytics is able to index and populate related metrics on Another World's Dune [dashboard](https://dune.com/jackieleeeth/anotherworld).

## Quick Start
installation
`yarn`

run tests
`npx hardhat test`
