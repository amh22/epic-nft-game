import React, { Fragment, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayerData } from '../../constants'
import myEpicGame from '../../utils/MyEpicGame.json'
import './Arena.css'
import LoadingIndicator from '../LoadingIndicator'

// We pass in our characterNFT metadata so we can show a cool card in our UI

const Arena = ({ characterNFT, setCharacterNFT }) => {
  const [gameContract, setGameContract] = useState(null)
  const [boss, setBoss] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [playerId, setPlayerId] = useState([])
  console.log('🚀 ~ file: index.js ~ line 15 ~ Arena ~ playerId', playerId)

  const [attackState, setAttackState] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Actions
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking')
        // console.log('Attacking boss...')
        const attackTxn = await gameContract.attackBoss()
        await attackTxn.wait()
        // console.log('attackTxn:', attackTxn)
        setAttackState('hit')
        // Set your toast state to true and then false 5 seconds later
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error attacking boss:', error)
      setAttackState('')
    }
  }

  useEffect(() => {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer)

      setGameContract(gameContract)
    } else {
      console.log('Ethereum object not found')
    }
  }, [])

  // Get Current # of Dwight Club Members
  useEffect(() => {
    // const fetchAllNFTMetadata = async () => {
    //   const players = await gameContract.getAllPlayers()

    //   if (players.length > 0) {
    //     setPlayerCount(players.length)
    //   } else {
    //     console.log('Currently there are no Dwight Club members.')
    //   }
    //   // Once we are done with all the fetching, set loading state to false
    //   // setIsLoading(false)
    // }

    const fetchAllNFTCharacterAttributes = async () => {
      const players = await gameContract.getAllPlayers()
      // console.log('🚀 ~ file: index.js ~ line 73 ~ fetchAllNFTCharacterAttributes ~ players', players)

      players.map((player) => {
        let playerId = player

        return setPlayerId((prevState) => [...prevState, playerId])
      })

      // const allCharacters = await gameContract.getUserNFTCharacterAttributes(1)
      // // console.log('🚀 ~ file: index.js ~ line 73 ~ fetchAllNFTCharacterAttributes ~ allCharacters', allCharacters)

      // if (allCharacters.length > 0) {
      //   setAllNFTs(allCharacters)
      // } else {
      //   console.log('Currently there are no Dwight Club members.')
      // }
      // Once we are done with all the fetching, set loading state to false
      // setIsLoading(false)
    }

    // Setup logic when this EVENT is fired off
    const onNFTMint = async (_characterIndex) => {
      const newCharacterType = _characterIndex.toNumber()

      // console.log(`onNFTMinted: New Character: ${newCharacterType}`)

      const players = await gameContract.getAllPlayers()

      // if (players.length > 0) {
      //   setPlayerCount(players.length)
      // } else {
      //   console.log('Currently there are no Dwight Club members.')
      // }
    }

    // We only want to run this, if we have a connected wallet, so:
    if (gameContract) {
      // console.log('CurrentAccount:', currentAccount)
      // fetchAllNFTMetadata()
      fetchAllNFTCharacterAttributes()
      gameContract.on('NFTMinted', onNFTMint)
    }
  }, [gameContract])

  // Get the Boss
  useEffect(() => {
    // Setup async function that will get the boss from our contract and set it in state
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss()
      // console.log('Boss:', bossTxn)
      setBoss(transformCharacterData(bossTxn))
    }

    // Setup logic when this event is fired off
    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber()
      const playerHp = newPlayerHp.toNumber()

      // console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`)

      // Update both player and boss Hp
      setBoss((prevState) => {
        return { ...prevState, hp: bossHp }
      })

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp }
      })
    }

    if (gameContract) {
      // gameContract is ready to go! Let's fetch our boss
      fetchBoss()
      gameContract.on('AttackComplete', onAttackComplete)
    }

    // Make sure to clean up this event when this component is removed
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete)
      }
    }
  }, [gameContract, setCharacterNFT])

  // Get ALL PLAYERS
  // useEffect(() => {
  //   const getPlayers = async () => {
  //     try {
  //       console.log('Getting ALL PLAYERS')

  //       // Call contract to get all player ID's
  //       const players = await gameContract.getAllPlayers()
  //       console.log('All Players:', players)
  //       console.log('#AllPlayers Length:', players.length)
  //       console.log('Player[0]:', players[0].id)
  //       console.log('Player[0].toNumber:', players[0].id.toNumber())

  //       const characters = players.map((playerData) => transformAllPlayerData(playerData))
  //       console.log('🚀 ~ file: index.js ~ line 106 ~ getPlayers ~ characters', characters)
  //       console.log('🚀 ~ file: index.js ~ line 106 ~ getPlayers ~ length', characters.length)
  //       console.log('🚀 ~ file: index.js ~ line 106 ~ getPlayers ~ character[0]', characters[0].id)

  //       // Get Player NFT attributes
  //       let i = 1
  //       const playerAttributes = await gameContract.tokenURI(i)
  //       const json = atob(playerAttributes.substring(29))
  //       const nft = await JSON.parse(json)
  //       setAllNFTs((prev) => ({ ...prev, [i.toString()]: nft }))

  //       // Set Player Count in state
  //       setPlayerCount(players)
  //     } catch (error) {
  //       // console.error('Something went wrong fetching players:', error)
  //       alert('Sorry, something went wrong fetching players. Please refresh the page and try again.')
  //     }
  //   }

  //   // Add a callback method that will fire when this event
  //   // (i.e. when the button to mint an NFT) is received
  //   const onCharacterMint = async (sender, tokenId, characterIndex) => {
  //     // console.log(
  //     //   `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
  //     // )

  //     // Once our character NFT is minted we can fetch the metadata from our contract
  //     // and set it in state to move onto the Arena
  //     if (gameContract) {
  //       const characterNFT = await gameContract.checkIfUserHasNFT()
  //       console.log('CharacterNFT: ', characterNFT)
  //       setCharacterNFT(transformCharacterData(characterNFT))
  //     }
  //   }

  //   // If our gameContract is ready, let's get characters!
  //   if (gameContract) {
  //     getPlayers()
  //     // The Listener
  //     // Use our gameContract object to listen for the 'CharacterNFTMinted' fired from our smart contact
  //     // when it is fired, we run the 'onCharacterMint' logic
  //     gameContract.on('CharacterNFTMinted', onCharacterMint)
  //   }

  //   return () => {
  //     // When your component unmounts, let's make sure to clean up this listener
  //     if (gameContract) {
  //       gameContract.off('CharacterNFTMinted', onCharacterMint)
  //     }
  //   }
  // }, [gameContract, setCharacterNFT])

  return (
    <div className='arena-container'>
      {/* Add your toast HTML right here */}
      {boss && showToast && (
        <div id='toast' className='show'>
          <div id='desc'>{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}

      {/* The BOSS */}
      {boss && (
        <Fragment>
          {/* {gameContract && <p className='sub-text'>Dwight Club Members: {playerCount}</p>} */}
          <div className='boss-container'>
            <div className={`boss-content ${attackState}`}>
              <h2>🔥 {boss.name} 🔥</h2>
              <div className='image-content'>
                <img src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
                <div className='health-bar'>
                  <progress value={boss.hp} max={boss.maxHp} />
                  <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                </div>
              </div>
            </div>
            <div className='attack-container'>
              <button className='cta-button' onClick={runAttackAction}>
                {`💥 Attack ${boss.name}`}
              </button>
              {attackState === 'attacking' && (
                <div className='loading-indicator'>
                  <LoadingIndicator />
                  <p>Attacking ⚔️</p>
                </div>
              )}
            </div>
          </div>
        </Fragment>
      )}

      {/* Character NFT */}
      {characterNFT && (
        <div className='players-container'>
          <div className='player-container'>
            <h2>Your Character</h2>
            <div className='player'>
              <div className='image-content'>
                <h2>{characterNFT.name}</h2>
                <img
                  src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className='health-bar'>
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className='stats'>
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Arena
