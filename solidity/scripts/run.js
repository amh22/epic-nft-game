const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame')
  const gameContract = await gameContractFactory.deploy(
    ['Powerpuff Girl', 'Miyagi Sensei', 'Hei Hei'], // Names
    [
      'https://i.imgur.com/X3U7OX6.png',
      'https://i.imgur.com/FGfU7Ye.jpeg', // Images
      'https://i.imgur.com/NBQ6YyF.png',
    ],
    [500, 350, 200], // HP values
    [100, 50, 25], // Attack damage values
    'Dwight Schrute', // Boss name
    'https://i.imgur.com/2GIj41D.jpeg', // Boss image
    10000, // Boss hp
    50 // Boss attack damage
  )
  await gameContract.deployed()
  console.log('Contract deployed to:', gameContract.address)

  let txn
  // We only have three characters.
  // Let's mint an NFT w/ the character at index 2 of our array.
  txn = await gameContract.mintCharacterNFT(2)
  await txn.wait()

  txn = await gameContract.attackBoss()
  await txn.wait()

  txn = await gameContract.attackBoss()
  await txn.wait()

  // Get the value of the first NFT's URI.
  // Platforms like OpenSea and Rarible know to hit tokenURI
  // since that's the standard way to retrieve the NFTs metadata.
  // * tokenURI actually has a specific format - it expects the NFT data in JSON (Base64 encoded)
  let returnedTokenUri = await gameContract.tokenURI(1)
  console.log('Token URI:', returnedTokenUri)
}

const runMain = async () => {
  try {
    await main()
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

runMain()