const CONTRACT_ADDRESS = '0xF4AcCd0FCB0313d0050846634163a0c6971B667A'
// const CONTRACT_ADDRESS = '0xC9dAE289A4cf447E7f33923af89d7426d7139637'

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  }
}

export { CONTRACT_ADDRESS, transformCharacterData }
