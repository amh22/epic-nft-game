const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory('MyEpicGame')
  const gameContract = await gameContractFactory.deploy(
    ['Powerpuff Girl', 'Miyagi Sensei', 'Hei Hei'], // Names
    [
      'QmdyiS166Pr8SQZPkpnmz3AGkJ7qghdAKgBEssYn6cRk82',
      'QmZyjf4kDhQrWiTaTUK9odX7VDoeJzV5LXoSrAzSUVUTCm', // Images
      'QmPspAQkzYn2KrV53kMWJtdyv8VxnfG1Z7R58FAgN4PZaM',
    ],
    [500, 350, 200], // HP values
    [100, 50, 25], // Attack damage values
    'Dwight Schrute', // Boss name
    'Qmd8G2boWJDUxA3DRneuYPL4F44X1XoFRZYxv4gx7gWj7q', // Boss image
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

  txn = await gameContract.mintCharacterNFT(1)
  await txn.wait()

  txn = await gameContract.mintCharacterNFT(0)
  await txn.wait()

  // txn = await gameContract.attackBoss()
  // await txn.wait()

  // txn = await gameContract.attackBoss()
  // await txn.wait()

  // Get the value of the first NFT's URI.
  // Platforms like OpenSea and Rarible know to hit tokenURI
  // since that's the standard way to retrieve the NFTs metadata.
  // * tokenURI actually has a specific format - it expects the NFT data in JSON (Base64 encoded)
  let returnedTokenUri = await gameContract.tokenURI(1)
  console.log('Token URI:', returnedTokenUri)

  let allChars = await gameContract.getAllDefaultCharacters()
  console.log('All Characters:', allChars)

  let all = await gameContract.getAllPlayers()
  console.log('All Users:', all)

  // let holders = await gameContract.getNFTHolder('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
  // console.log('All Holders:', holders)

  // let holderAttributes = await gameContract.getUserNFTCharacterAttributes(1)
  // console.log('Holder Attributes:', holderAttributes)
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
