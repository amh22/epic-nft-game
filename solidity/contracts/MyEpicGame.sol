// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Chainlink VRF to inherit from.
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

// Helper we wrote to encode in Base64.
import { Base64 } from "./libraries/Base64.sol";

// Our contract inherits from ERC721, which is the standard NFT contract!

contract MyEpicGame is ERC721, VRFConsumerBase {

  /* ----------- CHARACTERS ------------- */

  // We hold our character's BASE ATTRIBUTES in a struct (a user defined data type).

  struct CharacterAttributes {
    uint characterIndex;
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
    uint damageInflicted;
  }

  // Declare an ARRAY called 'defaultCharacters' based on the 'CharacterAttributes' struct (eg: defaultCharacters[2])
  CharacterAttributes[] defaultCharacters;


  // CREATE 2 STATE VARIABLES - like permanent global variables on the contract i.e. key: value pairs

  mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
  // We map the NFT's ID (tokenId) to the 'CharacterAttributes' struct. i.e. we use the tokenId as an index to find the CharacterAttributes with that index
  // We do this when we mint the NFT

  mapping(address => uint256) public nftHolders;
  // 'nftHolders' lets us map the address (msg.sender) of a Player to the ID of the NFT they own
  // Eg: nftHolders[INSERT_PUBLIC_ADDRESS_HERE]

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  // The tokenId is the NFTs unique identifier, it's just a number that goes 0, 1, 2, 3, etc.


  /* ----------- THE BOSS ------------- */

  struct BigBoss {
    string name;
    string imageURI;
    uint hp;
    uint maxHp;
    uint attackDamage;
  }
  // Create a bigBoss VARIABLE that will represent our boss
  BigBoss public bigBoss;


  /* ----------- ALL GAME PLAYERS ------------- */

  // So we can hold all of our Game Players (i.e. those who have minted an NFT).
  struct AllPlayers {
    uint256 id;
    address wallet;
  }

  // Declare an ARRAY called 'gameUsers' based on the 'AllPlayers' struct
  AllPlayers[] gameUsers;


  /* ---------- OUR EVENTS ---------- */
  // We need to tell Solidity the format of our events before we start firing them

  // On Successful Mint - it fires when we finish minting the NFT
  event CharacterNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);

  // On Successful Attack - on the boss
  event AttackComplete(uint newBossHp, uint newPlayerHp, uint newPlayerDmgInflicted, string randomFactor);

  // When a new NFT has been minted (by anyone)
  event NFTMinted(uint256 characterIndex);



  /* ---------- VARIABLES FOR OUR VRF RANDOM NUMBER ---------- */

  bytes32 internal _keyHash;
  uint256 internal _fee;
  address public VRFCoordinator;
    // rinkeby: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
  address public LinkToken;

  uint256 public randomResult;

  /* ---------- CONTRACT OWNER ---------- */

  address public owner;

  modifier onlyOwner {
    require(msg.sender == owner, "You are not the owner.");
    _;
  }


  /* ---------- CONSTRUCTOR ---------- */
  // We pass Data into the contract when it's first created to initialize the characters.

  constructor(
    string[] memory characterNames,
    string[] memory characterImageURIs,
    uint[] memory characterHp,
    uint[] memory characterAttackDmg,
    uint[] memory characterDmgInflicted,
    string memory bossName,
    string memory bossImageURI,
    uint bossHp,
    uint bossAttackDamage,
    address vrfCoordinatorAddress,
    address linkTokenAddress
    // Below we add some special identifier symbols for our NFT (which is just a token) - name and symbol.
    // We also add our Chainlink VRF details
  )
    ERC721("DClub", "TEST")
    VRFConsumerBase(vrfCoordinatorAddress, linkTokenAddress)
  {

    /* -------- SET THE OWNER -------- */
    owner = msg.sender;

    /* -------- CHAINLINK VRF -------- */

    // Chainlink VRF Network Oracle and Fee Details
    _keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
    _fee = 0.1 * 10**18; // 0.1 LINK
    VRFCoordinator = vrfCoordinatorAddress;
    LinkToken = linkTokenAddress;
    randomResult = 1;


    /* ---------- INITIALIZE THE BOSS --------- */
    // Save it to our global "bigBoss" state variable.

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
        attackDamage: characterAttackDmg[i],
        damageInflicted: characterDmgInflicted[i]
      }));

      CharacterAttributes memory c = defaultCharacters[i];

      // Hardhat's use of console.log() allows up to 4 parameters in any order of following types: uint, string, bool, address
      console.log("Done initializing %s w/ HP %s, img %s", c.name, c.hp, c.imageURI);

    }
    // I increment tokenIds here so that my first NFT has an ID of 1.
    // In Solidity, 0 is a default value and we try to stay away from default values.
    _tokenIds.increment();
  }

  /* -------- CHAINLINK VRF -------- */

  /* Requests Randomness */

  function getRandomNumber() public returns (bytes32 requestId) {
      require(LINK.balanceOf(address(this)) >= _fee, "Not enough LINK - fill contract with faucet");
      return requestRandomness(_keyHash, _fee);
  }

  /* Callback function used by VRF Coordinator */
  // Here we receive the verified randomness and do somethinh with it
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
      randomResult = randomness % 100;
  }

  // Implement a withdraw function to avoid locking your LINK in the contract
  function withdrawLINK(address to, uint256 value) public onlyOwner {
      require(LINK.transfer(to, value), "Not enough LINK");
    }


  /* ------ CALLED FROM THE FRONTEND to CHECK IF THE SIGNED IN USER ALERADY HAS AN NFT ------------- */
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

  /* ------ CALLED FROM THE FRONTEND to GET NFT ATTRIBUTES FOR all EXISTING USERS based on WALLET ADDRESSES ------------- */
  function getUserNFTCharacterAttributes(uint256 _tokenId) public view returns (CharacterAttributes memory) {
      // The tokenID passed in from the frontend
      uint256 userNftTokenId = _tokenId;
      // If the user has a tokenId, return their character.
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

  function getAllPlayers() public view returns (AllPlayers[] memory) {
    return gameUsers;
  }



  /*  ********** NFT MINTING ********** */

  // Generates an NFT based on the characterId (i.e. _characterIndex) passed into the contract at time of mint!
  function mintCharacterNFT(uint _characterIndex) external {

    // Set the NFT's ID to the current _tokenIds
    uint256 newItemId = _tokenIds.current();
    // This is a state variable which means if we change it, the value is stored on the contract directly like a global variable that stays permanently in memory.

    // Assigns the tokenId to the caller's wallet address.
    _safeMint(msg.sender, newItemId);
    // You can't call a contract anonymously, you need to have your wallet credentials connected. It's like signing in and being authenticated


    // We map the tokenId to their character attributes.
    nftHolderAttributes[newItemId] = CharacterAttributes({
      characterIndex: _characterIndex,
      name: defaultCharacters[_characterIndex].name,
      imageURI: defaultCharacters[_characterIndex].imageURI,
      hp: defaultCharacters[_characterIndex].hp,
      maxHp: defaultCharacters[_characterIndex].hp,
      attackDamage: defaultCharacters[_characterIndex].attackDamage,
      damageInflicted: defaultCharacters[_characterIndex].damageInflicted
    });

    console.log("Minted NFT w/ tokenId %s and characterIndex %s", newItemId, _characterIndex);

    // Push ID's of new players to the 'gameUsers' array as they mint
    gameUsers.push(AllPlayers({
        id: newItemId,
        wallet: msg.sender
      }));

    console.log("Pushed new player to gameUsers array w/ tokenId %s and wallet %s", newItemId, msg.sender);


    // Keep an easy way to see who owns what NFT.
    nftHolders[msg.sender] = newItemId;

    // Increment the tokenId for the next person that uses it.
    _tokenIds.increment();

    /* ---- Fire Off EVENTS ---- */

    // notify the user of a successful mint (not 'mine')
    emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);

    // notify the frontend when a new Dwight Club member has joined
    emit NFTMinted(_characterIndex);
  }

  // Platforms like OpenSea and Rarible know to hit tokenURI (i.e. they call it)
  // since that's the standard way to retrieve the NFTs metadata.
  // * tokenURI actually has a specific format - it expects the NFT data in JSON (Base64 encoded)
  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    CharacterAttributes memory charAttributes = nftHolderAttributes[_tokenId];

    string memory strHp = Strings.toString(charAttributes.hp);
    string memory strMaxHp = Strings.toString(charAttributes.maxHp);
    string memory strAttackDamage = Strings.toString(charAttributes.attackDamage);
    string memory strDamageInflicted = Strings.toString(charAttributes.damageInflicted);

    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "',
            charAttributes.name,
            ' -- NFT #: ',
            Strings.toString(_tokenId),
            '", "description": "This is an NFT that gives you entry to the Dwight Club game!", "image": "ipfs://',
            charAttributes.imageURI,
            '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
            strAttackDamage,'}, { "trait_type": "Damage Inflicted", "value": ',
            strDamageInflicted,'} ]}'
          )
        )
      )
    );

    string memory output = string(
      abi.encodePacked("data:application/json;base64,", json)
    );

    return output;
  }


  /* --------- ATTACK BOSS ---------- */

  function attackBoss() public {
    // Get the state of the player's NFT.
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
    CharacterAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
    // console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", player.name, player.hp, player.attackDamage);
    // console.log("Damage Inflicted", player.damageInflicted);
    // console.log("Boss %s has %s HP and %s AD", bigBoss.name, bigBoss.hp, bigBoss.attackDamage);


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

    string memory randomType = 'normal';  // consider user bytes32 type instead for strings

    // Allow player to attack boss.
    if (bigBoss.hp < player.attackDamage) {
      bigBoss.hp = 0;
    } else if (randomResult > 50) {
      randomType = 'double';
      bigBoss.hp = bigBoss.hp - player.attackDamage * 2; // double damage!
      player.damageInflicted = player.damageInflicted + player.attackDamage * 2;
    } else {
      bigBoss.hp = bigBoss.hp - player.attackDamage;
      player.damageInflicted = player.damageInflicted + player.attackDamage;
    }

    // Allow boss to attack player.
    if (player.hp < bigBoss.attackDamage) {
      player.hp = 0;
    } else if (randomResult < 50) {
      randomType = 'missed';
      player.hp = player.hp;  // boss missed!
    } else {
      player.hp = player.hp - bigBoss.attackDamage;
    }

    /* ---------- SET A NEW RANDOM NUMBER ON ATTACK COMPLETE ------------ */
    getRandomNumber();


    // Fires off the event which we can use in our frontend to dynamically update
    // the HP UI
    emit AttackComplete(bigBoss.hp, player.hp, player.damageInflicted, randomType);



    // Console for ease.
    // console.log("Player attacked boss. New boss hp: %s\n", bigBoss.hp);
    // console.log("Boss attacked player. New player hp: %s\n", player.hp, player.damageInflicted);
  }

}