import React, { Fragment, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData, transformBossData } from '../../constants'
import myEpicGame from '../../utils/MyEpicGame.json'
import './Arena.css'
import LoadingIndicator from '../LoadingIndicator'

const Arena = ({ characterNFT, setCharacterNFT }) => {
  const [gameContract, setGameContract] = useState(null)
  // console.log('🚀 ~ file: index.js ~ line 12 ~ Arena ~ gameContract', gameContract)
  const [currentPlayerWallet, setCurrentPlayerWallet] = useState(null)
  const [boss, setBoss] = useState(null)
  const [allNftMetadata, setAllNftMetadata] = useState({})

  const [attackState, setAttackState] = useState('')
  const [showToast, setShowToast] = useState(false)

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      // Fancy method to request access to account.
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      // Boom! This should print out public address once we authorize Metamask.
      // console.log('Connected', accounts[0])
      setCurrentPlayerWallet(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

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
      connectWalletAction()
    } else {
      console.log('Ethereum object not found')
    }
  }, [])

  // Get ALL Dwight Club Members Data
  useEffect(() => {
    const fetchAllNFTMetadata = async () => {
      // console.log('Checking for ALL NFT metadata)
      const players = await gameContract.getAllPlayers()

      if (players.length > 0) {
        players.map(async (player) => {
          let playerID = player.id
          let playerWallet = player.wallet
          const nftAttributes = await gameContract.getUserNFTCharacterAttributes(playerID)
          console.log('🚀 ~ file: index.js ~ line 88 ~ players.map ~ nftAttributes', nftAttributes)
          const metadata = transformCharacterData(nftAttributes)
          console.log('🚀 ~ file: index.js ~ line 71 ~ players.map ~ metadata', metadata)
          metadata['wallet'] = playerWallet
          return setAllNftMetadata((prevState) => ({ ...prevState, [playerID.toString()]: metadata }))
        })
      } else {
        console.log('Currently there are no Dwight Club members.')
      }

      // Once we are done with all the fetching, set loading state to false
      // setIsLoading(false)
    }

    // Setup logic when this EVENT is fired off
    const onCharacterMint = async () => {
      const players = await gameContract.getAllPlayers()

      if (players.length > 0) {
        players.map(async (player) => {
          let playerID = player.id
          let playerWallet = player.wallet
          const nftAttributes = await gameContract.getUserNFTCharacterAttributes(playerID)
          const metadata = transformCharacterData(nftAttributes)

          metadata['wallet'] = playerWallet
          return setAllNftMetadata((prevState) => ({ ...prevState, [playerID.toString()]: metadata }))
        })
      } else {
        console.log('Currently there are no Dwight Club members.')
      }
    }

    // Setup logic when this event is fired off
    const onAttackComplete = async () => {
      const players = await gameContract.getAllPlayers()

      if (players.length > 0) {
        players.map(async (player) => {
          let playerID = player.id
          let playerWallet = player.wallet.toLowerCase()
          const nftAttributes = await gameContract.getUserNFTCharacterAttributes(playerID)
          const metadata = transformCharacterData(nftAttributes)

          metadata['wallet'] = playerWallet
          return setAllNftMetadata((prevState) => ({ ...prevState, [playerID.toString()]: metadata }))
        })
      } else {
        console.log('Currently there are no Dwight Club members.')
      }
    }

    // If our gameContract is ready, let's get ALL metadata!
    if (gameContract) {
      fetchAllNFTMetadata()
      // Listen to our contract on chain for when a new NFT is minted
      gameContract.on('CharacterNFTMinted', onCharacterMint)
      gameContract.on('AttackComplete', onAttackComplete)
    }
  }, [gameContract])

  /* -------- GET THE BOSS --------- */
  useEffect(() => {
    // Setup async function that will get the boss from our contract and set it in state
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss()
      // console.log('Boss:', bossTxn)
      setBoss(transformBossData(bossTxn))
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

  const styles = {
    tableRow: {
      height: '60px',
    },
    tableData: {
      padding: '5px 20px',
    },
  }

  return (
    <Fragment>
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
      <div className='arena-container'>
        <div className='bout-stats'>
          <div>
            <h2>Bout Stats</h2>
          </div>
          <div className='bout-stats-data'>
            <table>
              <thead>
                <tr style={styles.tableRow}>
                  <th>Character</th>
                  <th>Owner</th>
                  <th>HP</th>
                  <th>Damage Dealt</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(allNftMetadata).map((id, i) => (
                  <tr style={styles.tableRow} key={i}>
                    <td style={styles.tableData}>
                      <img
                        className='bout-stats-image'
                        src={`https://cloudflare-ipfs.com/ipfs/${allNftMetadata[id].imageURI}`}
                        alt={`Character ${allNftMetadata[id].name}`}
                      />
                    </td>
                    <td style={styles.tableData}>
                      {allNftMetadata[id].wallet === currentPlayerWallet ? 'You' : allNftMetadata[id].wallet}
                    </td>
                    <td style={styles.tableData}>{allNftMetadata[id].hp}</td>
                    <td style={styles.tableData}>{allNftMetadata[id].damageInflicted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Arena
