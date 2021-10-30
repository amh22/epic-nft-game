// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

// Helper we wrote to encode in Base64
import { Base64 } from "./libraries/Base64.sol";

// Our contract inherits from ERC721, which is the standard NFT contract!
contract MyEpicGame is ERC721 {

  // We hold our character's attributes in a struct.
  struct CharacterAttributes {
    uint characterIndex;
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }

  // The tokenId is the NFTs unique identifier, it's just a number that goes
  // 0, 1, 2, 3, etc.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Create an array to help us hold the default data for our characters.
  // This will be helpful when we mint new characters and need to know
  // things like their HP, AD, etc.
  CharacterAttributes[] defaultCharacters;

  // We map from the nft's ID (tokenId) => that NFTs attributes (CharacterAttributes) struct.
  // It's where we store the state of the player's NFTs.
  // nftHolderAttributes is a State Variable on the contract that is publicly available
  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

  // We hold our Boss's attributes in a struct.
  struct BigBoss {
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }
  // Create a bigBoss variable that will represent our boss
  BigBoss public bigBoss;

  // A mapping from the User's address to the tokenID of the NFT they own. Gives me an ez way
  // to store the owner of the NFT and reference it later. Eg: nftHolders[INSERT_PUBLIC_ADDRESS_HERE]
  // nftHolders is a State Variable on the contract that is publicly available
  mapping(address => uint256) public nftHolders;

  // Let user know that the mint was successful
  // It fires when we finish minting the NFT
  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
  // Let the user know the attack on the boss has been completed
  event AttackComplete(uint newBossHp, uint newPlayerHp);

  // We pass Data into the contract when it's first created to initialize the characters.
  // We pass these values in from from run.js or deploy.js.
  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    string memory bossName, // These new variables would be passed in via run.js or deploy.js.
    string memory bossImageURI,
    uint bossHp,
    uint bossAttackDamage
    // Below we add some special identifier symbols for our NFT.
    // This is the name and symbol for our token, ex Ethereum and ETH. Ours is called
    // Dwight Club and DUND. Remember, an NFT is just a token!
  )
    ERC721("Fight Club Test", "DUND")
  {
    // Initialize the boss. Save it to our global "bigBoss" state variable.
  bigBoss = BigBoss({
    name: bossName,
    imageURI: bossImageURI,
    hp: bossHp,
    maxHp: bossHp,
    attackDamage: bossAttackDamage
  });

  console.log("Done initializing boss %s w/ HP %s, img %s", bigBoss.name, bigBoss.hp, bigBoss.imageURI);

    // Loop through all the characters, and save their values in our contract so
    // we can use them later when we mint our NFTs.
    for(uint i = 0; i < characterNames.length; i += 1) {
      defaultCharacters.push(CharacterAttributes({
        characterIndex: i,
        name: characterNames[i],
        imageURI: characterImageURIs[i],
        hp: characterHp[i],
        maxHp: characterHp[i],
        attackDamage: characterAttackDmg[i]
      }));

      CharacterAttributes memory c = defaultCharacters[i];

      // Hardhat's use of console.log() allows up to 4 parameters in any order of following types: uint, string, bool, address
      console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);

    }
    // I increment tokenIds here so that my first NFT has an ID of 1.
    // In Solidity, 0 is a default value and we try to stay away from default values.
    _tokenIds.increment();
  }

  function checkIfUserHasNFT() public view returns (CharacterAttributes memory) {
    // Get the tokenId of the user's character NFT
    uint256 userNftTokenId = nftHolders[msg.sender];
    // If the user has a tokenId in the map, return their character.
    if (userNftTokenId > 0) {
      return nftHolderAttributes[userNftTokenId];
    }
    // Else, return an empty character.
    else {
      CharacterAttributes memory emptyStruct;
      return emptyStruct;
    }
  }

  function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
    return defaultCharacters;
  }

  function getBigBoss() public view returns (BigBoss memory) {
    return bigBoss;
  }

  // This is the function where the actual minting is happening
  // Users will be able to hit this function and get their NFT based on the
  // characterId (i.e. _characterIndex) they send into the contract at time of mint!
  function mintCharacterNFT(uint _characterIndex) external {
    // Get current tokenId (starts at 1 since we incremented in the constructor).
    // _tokenIds is a state variable which means if we change it, the value is stored
    // on the contract directly like a global variable that stays permanently in memory.
    uint256 newItemId = _tokenIds.current();

    // The magical function! Assigns the tokenId to the caller's wallet address.
    // You can't call a contract anonymously, you need to have your wallet credentials connected.
    // It's like signing in and being authenticated
    _safeMint(msg.sender, newItemId);

    // We map the tokenId to their character attributes.
    nftHolderAttributes[newItemId] = CharacterAttributes({
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].hp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage
    });

    console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);

    // Keep an easy way to see who owns what NFT.
    nftHolders[msg.sender] = newItemId;

    // Increment the tokenId for the next person that uses it.
    _tokenIds.increment();

    // Fires off the event so we can notify the user of a successful mint (not 'mine')
    emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

    string memory strHp = Strings.toString(charAttributes.hp);
    string memory strMaxHp = Strings.toString(charAttributes.maxHp);
    string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);

    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "',
            charAttributes.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": "This is an NFT that lets people play in the Dwight Club game!", "image": "ipfs://',
            charAttributes.imageURI,
            '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
            strAttackDamage,'} ]}'
          )
        )
      )
    );

    string memory output = string(
      abi.encodePacked("data:application/json;base64,", json)
    );

    return output;
  }

  function attackBoss() public {
    // Get the state of the player's NFT.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
    console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
    console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);

    // Make sure the player has more than 0 HP.
    require (
      player.hp > 0,
      "Error: character must have HP to attack boss."
    );

    // Make sure the boss has more than 0 HP.
    require (
      bigBoss.hp > 0,
      "Error: boss must have HP to attack boss."
    );

    // Allow player to attack boss.
    if (bigBoss.hp < player.attackDamage) {
      bigBoss.hp = 0;
    } else {
      bigBoss.hp = bigBoss.hp - player.attackDamage;
    }

    // Allow boss to attack player.
    if (player.hp < bigBoss.attackDamage) {
      player.hp = 0;
    } else {
      player.hp = player.hp - bigBoss.attackDamage;
    }

    // Fires off the event which we can use in our frontend to dynamically update
    // the HP UI
    emit AttackComplete(bigBoss.hp, player.hp);

    // Console for ease.
    console.log("Player attacked boss. New boss hp: %s\n", bigBoss.hp);
    console.log("Boss attacked player. New player hp: %s\n", player.hp);
  }

}