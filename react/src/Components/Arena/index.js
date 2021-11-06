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

  const [buyHp, setbuyHp] = useState('')

  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState('')

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

  // Run ATTACK Action
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking')
        // console.log('Attacking boss...')
        // Note: if there is no LINK this will do nothing and will confuse the player
        // Todo: need to check for LINK balance
        const attackTxn = await gameContract.attackBoss()
        await attackTxn.wait()

        setAttackState('hit')
        // Set your toast state to true and then false 5 seconds later
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          setToastType('')
        }, 5000)
      }
    } catch (error) {
      console.error('Error attacking boss:', error)
      setAttackState('')
    }
  }

  // Run HP RESET Action
  const resetHpAction = async () => {
    try {
      if (gameContract) {
        setbuyHp('buying')
        console.log('Resetting HP...')
        const buyTxn = await gameContract.purchaseHp()
        await buyTxn.wait()

        setbuyHp('complete')
        // Set your toast state to true and then false 5 seconds later
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          setbuyHp('')
        }, 5000)
      }
    } catch (error) {
      console.error('Error resetting HP:', error)
      setbuyHp('')
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
          // console.log('🚀 ~ file: index.js ~ line 88 ~ players.map ~ nftAttributes', nftAttributes)
          const metadata = transformCharacterData(nftAttributes)
          // console.log('🚀 ~ file: index.js ~ line 71 ~ players.map ~ metadata', metadata)
          metadata['wallet'] = playerWallet.toLowerCase() // to lowercase to match format received Ethereum window query
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

    // Setup logic when this event is fired off
    const onHpPurchaseComplete = async () => {
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
      gameContract.on('HpPurchaseComplete', onHpPurchaseComplete)
    }

    // Make sure to clean up the events when this component is removed
    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint)
        gameContract.off('AttackComplete', onAttackComplete)
        gameContract.off('HpPurchaseComplete', onHpPurchaseComplete)
      }
    }
  }, [gameContract])

  /* -------- GET THE BOSS, HANDLED ATTACKS, PURCHASE HP --------- */
  useEffect(() => {
    // Setup async function that will get the boss from our contract and set it in state
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss()

      setBoss(transformBossData(bossTxn))
    }

    // Setup logic when this event is fired off
    const onAttackComplete = (
      newBossHp,
      newPlayerHp,
      newPlayerDmgInflicted,
      randomFactor,
      originalRandom,
      newRandom
    ) => {
      const bossHp = newBossHp.toNumber()
      const playerHp = newPlayerHp.toNumber()
      const playerDmgInflicted = newPlayerDmgInflicted.toNumber()

      const randomType = randomFactor
      // console.log('🚀 ~ file: index.js ~ line 180 ~ onAttackComplete ~ randomType', randomType)

      // const getOriginalRandom = originalRandom
      // console.log('🚀 ~ file: index.js ~ line 209 ~ onAttackComplete ~ getOriginalRandom', getOriginalRandom)

      const getNewRandom = newRandom.toNumber()
      console.log('🚀 ~ file: index.js ~ line 212 ~ onAttackComplete ~ getNewRandom', getNewRandom)

      // Set TOAST TYPE message
      setToastType(randomType)

      // Update both player and boss Hp
      setBoss((prevState) => {
        return { ...prevState, hp: bossHp }
      })

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp, damageInflicted: playerDmgInflicted }
      })
    }

    // Setup logic when this event is fired off
    const onHpPurchaseComplete = (playerHpReset) => {
      console.log('Reset HP Triggered')
      const resetPlayerHp = playerHpReset.toNumber()
      console.log('🚀 ~ file: index.js ~ line 243 ~ onHpPurchaseComplete ~ resetPlayerHp', resetPlayerHp)

      // Set Reset to complete
      setbuyHp('complete')

      // Update Player's character
      setCharacterNFT((prevState) => {
        return { ...prevState, hp: resetPlayerHp }
      })
    }

    if (gameContract) {
      // gameContract is ready to go! Let's fetch our boss
      fetchBoss()
      // listen to contract for an attack
      gameContract.on('AttackComplete', onAttackComplete)
      gameContract.on('HpPurchaseComplete', onHpPurchaseComplete)
    }

    // Make sure to clean up this event when this component is removed
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete)
        gameContract.off('HpPurchaseComplete', onHpPurchaseComplete)
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
        {boss && showToast && (
          <Fragment>
            <div
              style={{
                display: 'flex',
              }}
            >
              <div id='toast' className='show'>
                {buyHp === 'complete' && (
                  <Fragment>
                    <div style={{ paddingTop: '30px' }}>
                      <div id='descHeader'>HP reset complete!</div>
                    </div>
                    <div style={{ padding: '20px 0px' }}>
                      <div id='desc'>{`💥 You now have ${characterNFT.hp} HP!`}</div>
                    </div>
                  </Fragment>
                )}

                {toastType === 'missed' && (
                  <Fragment>
                    <div style={{ paddingTop: '30px' }}>
                      <div id='descHeader'>Dwight Missed! Sweet move!</div>
                    </div>
                    <div style={{ padding: '20px 0px' }}>
                      <div id='desc'>{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
                      <div id='desc'>{`You suffered no damage!`}</div>
                    </div>
                  </Fragment>
                )}

                {toastType === 'double' && (
                  <Fragment>
                    <div style={{ paddingTop: '25px' }}>
                      <div id='descHeader'>BAM!!</div>
                      <div id='descHeader'>Your hit caused double damage!</div>
                    </div>
                    <div style={{ padding: '20px 0px' }}>
                      <div id='desc'>{`💥 ${boss.name} was hit for ${characterNFT.attackDamage * 2}!`}</div>
                      <div id='desc'>{`💥 You were hit for ${boss.attackDamage}!`}</div>
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </Fragment>
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
                {characterNFT.hp === 0 ? (
                  <button
                    style={{
                      height: '60px',
                      fontSize: '18px',
                      backgroundImage: 'linear-gradient(135deg, #ff380b 0%, #ff380b 100%)',
                      backgroundSize: '200% 200%',
                      color: 'white',
                      border: '0',
                      width: 'auto',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    onClick={resetHpAction}
                  >
                    {`Game Over! Click to reset your HP`}
                  </button>
                ) : (
                  <button className='cta-button' onClick={runAttackAction}>
                    {`💥 Attack ${boss.name}`}
                  </button>
                )}

                {attackState === 'attacking' && (
                  <div className='loading-indicator'>
                    <LoadingIndicator />
                    <p>Attacking ⚔️</p>
                  </div>
                )}

                {buyHp === 'buying' && (
                  <div className='loading-indicator'>
                    <LoadingIndicator />
                    <p>Resetting HP</p>
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
                  <th>HP Left</th>
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
