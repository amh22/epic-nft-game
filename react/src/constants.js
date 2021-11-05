const CONTRACT_ADDRESS = '0x156Dda5B284b63adACEeF914b570302F93a9d66D'
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
