# An Ethereum Turn-based NFT Game

The Dwight Club is a proof of concept (Rinkeby testnet) Web3 play-to-earn game. It's an ethereum turn-based NFT game where a user can mint an NFT character that can battle the evil boss Dwight Schrute! Image assets are stored on IPFS, and metadata updated on chain. The minted NFTs and their metadata are viewable on marketplaces such as OpenSea and Rarible.

Built with React and Solidity. Turn-based randomness was implemented using the Chainlink VRF, with some 'test LINK' sent to the contract to pay the Chainlink oracle fees.

The game's premise is simple. A user gets the option to mint one of three hero characters to fight Dwight Schrute. Once they've minted a character, that character NFT is available on-chain, including the associated metadata. The NFT image assets are stored on IPFS (InterPlanetary File System). After minting a hero character, the NFT and its metadata is viewable on marketplaces such as OpenSea (see the link below) and Rarible.

Each character comes with different HP (health points) and attack damage rating. If Dwight lands a punch, HP will be deducted from the user. If the user lands a punch, then Dwight's HP will be reduced. The changes are recorded on-chain and the NFT's metadata will be updated.

As it is a proof of concept, it was deployed to the Rinkeby testnet (an Ethereum test network), and not onto the Ethereum mainnet. This means you only need ‘test ETH’ to pay for the gas when minting your hero NFT and for interacting within the game. You'll also need a MetaMask wallet to connect to the app.

Note: interacting with wallets on mobiles is challenging, so best to use a laptop or desktop if you want to try it out.

The deployed app: https://dwightclub.netlify.app/

View the collection on OpenSea: https://testnets.opensea.io/collection/dwight-club-iii

The contract: https://rinkeby.etherscan.io/address/0x7367239dd93a3c2131d7a27d21956b9ee3a1c599

This is based of a [buildspace tutorial.](https://buildspace.so/projects)

See case study: https://www.gramercystudios.com/work/dwight-club/
