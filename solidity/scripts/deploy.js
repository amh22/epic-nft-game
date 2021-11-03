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
    [0, 0, 0], // Damage inflicted values
    'Dwight Schrute', // Boss name
    'Qmd8G2boWJDUxA3DRneuYPL4F44X1XoFRZYxv4gx7gWj7q', // Boss image
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
