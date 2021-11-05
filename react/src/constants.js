const CONTRACT_ADDRESS = '0x085eF2cdEfdF45449706687Cd2ab049355d35FE8'
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
