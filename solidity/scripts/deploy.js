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
