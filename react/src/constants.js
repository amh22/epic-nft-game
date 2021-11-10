const CONTRACT_ADDRESS = '0xDdA239DeBA5134aA5606Ea3EdB4DEa6008DFB570'
// const CONTRACT_ADDRESS = '0x442b69f741c41b6E37A810aa187A204200e559A5'
// const CONTRACT_ADDRESS = '0x786e9B57fA86945218Cc2E9Ea4becde0057aa30C'
// const CONTRACT_ADDRESS = '0x625Fa14f132961b69011e000f63bF1aF4d732139'
// const CONTRACT_ADDRESS = '0x457D1f552a32149Bef2A506fb50c4c80F8f57439'
// const CONTRACT_ADDRESS = '0xb90CD4E6503e3A85CB6bc72DE1596A227486D29E'
// const CONTRACT_ADDRESS = '0xE29288d8528E16b1B9fDb1F8A5154f9EeA3d061C'
// const CONTRACT_ADDRESS = '0xeB3369124545a96d419Dd69C22adE0dFB33ae585'
// const CONTRACT_ADDRESS = '0x25181421271465A8Bf5137F53E810A62152Bc299'
// const CONTRACT_ADDRESS = '0x4d86f5FD1028C34Cd159191c69F3Fd23C5d5869F'
// const CONTRACT_ADDRESS = '0x156Dda5B284b63adACEeF914b570302F93a9d66D'
// const CONTRACT_ADDRESS = '0x267c45e46b7eFDD9c877c00cdBAb59b8897fE62D'
// const CONTRACT_ADDRESS = '0x82aED879A43519414e88d6c692356c4eFeAe66B0'

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    damageInflicted: characterData.damageInflicted.toNumber(),
  }
}

const transformBossData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  }
}

export { CONTRACT_ADDRESS, transformCharacterData, transformBossData }
