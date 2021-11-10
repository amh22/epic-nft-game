import React, { useEffect, useState, useRef } from 'react'
import './SelectCharacter.css'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants'
import myEpicGame from '../../utils/MyEpicGame.json'
import { LoadingIndicator } from '../LoadingIndicator'

const SelectCharacter = ({ setCharacterNFT, setShowMintMessage }) => {
  const [characters, setCharacters] = useState([]) // Hold ALL of our character metadata from the contract
  const [gameContract, setGameContract] = useState(null) // Get access to all the functions on the contract
  const [mintingCharacter, setMintingCharacter] = useState(false)

  // Scroll to Mint in Progress indicator on minting
  const mintingIndicatorRef = useRef(null)
  const scrollToBottom = () => {
    mintingIndicatorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /* -------- Minting Action ----------- */
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        // scroll user to bottom to make sure they seey the 'minting in progress' indicator (used for mobile devices)
        scrollToBottom()

        // Show our loading indicator
        setMintingCharacter(true)

        const mintTxn = await gameContract.mintCharacterNFT(characterId)
        await mintTxn.wait()

        // Hide our loading indicator when minting is finished
        setMintingCharacter(false)
      }
    } catch (error) {
      alert(
        "Sorry, we've encounted an error. Check that you are on the Rinkeby Test Network. Please also make sure you have enough ETH to cover the gas. If so, please refresh the page and try again."
      )
      // If there is a problem, hide the loading indicator as well
      setMintingCharacter(false)
    }
  }

  // Render Methods (Characters)
  const renderCharacters = () =>
    characters.map((character, index) => {
      // console.log(character)
      return (
        <div className='character-item' key={character.name}>
          <div className='name-container'>
            <p>{character.name}</p>
          </div>
          <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
          <button
            type='button'
            className='character-mint-button'
            onClick={mintCharacterNFTAction(index)}
          >{`Mint ${character.name}`}</button>
        </div>
      )
    })

  /* ---------- Generate our gameContract object ------------ */
  useEffect(() => {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer)

      // NOW CONNECT TO THE BLOCKCHAIN! COOL! and Set our gameContract in state.
      setGameContract(gameContract)
    } else {
      console.log('Ethereum object not found')
    }
  }, [])

  /* ----------- Fetch ALL of the game characters ------------ */
  // and will continue to listen to see if our gameContract changes or is 'null'
  useEffect(() => {
    const getCharacters = async () => {
      try {
        // console.log('Getting contract characters to mint')

        // Call contract to get all mint-able characters
        const charactersTxn = await gameContract.getAllDefaultCharacters()
        // console.log('charactersTxn:', charactersTxn)

        // Go through all of our characters and transform the data
        const characters = charactersTxn.map((characterData) => transformCharacterData(characterData))

        // Set all mint-able characters in state
        setCharacters(characters)
      } catch (error) {
        // console.error('Something went wrong fetching characters:', error)
        alert(
          'Sorry, something went wrong fetching the characters. Check that you are on the Rinkeby Test Network, then please refresh the page and try again.'
        )
      }
    }

    // Add a callback method that will fire when this event
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      // console.log(
      //   `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      // )

      const nftId = tokenId.toNumber()

      // Now GET the character NFT metadata from our contract
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT()
        const transformCharData = transformCharacterData(characterNFT)

        transformCharData['token'] = nftId
        setCharacterNFT(transformCharData) // Set the character attributes to state
        setShowMintMessage(true) // Show the 'your player has been minted message in Arena
      }
    }

    // If our gameContract is ready, let's get characters!
    if (gameContract) {
      getCharacters()
      // The Listener
      // Use our gameContract object to listen for the 'CharacterNFTMinted' fired from our smart contact
      // when it is fired, we run the 'onCharacterMint' logic
      gameContract.on('CharacterNFTMinted', onCharacterMint)
    }

    return () => {
      // When your component unmounts, let's make sure to clean up this listener
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint)
      }
    }
  }, [gameContract, setCharacterNFT, setShowMintMessage])

  return (
    <div className='select-character-container'>
      <h2 style={{ paddingBottom: '30px' }}>Mint Your Hero. Choose wisely.</h2>
      {/* Only show this when there are characters in state */}
      {characters.length > 0 && <div className='character-grid'>{renderCharacters()}</div>}
      {/* Only show our loading state if mintingCharacter is true */}
      {mintingCharacter && (
        <div className='loading'>
          <div className='indicator'>
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          <img
            src='https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g'
            alt='Minting loading indicator'
          />
        </div>
      )}
      {/* For scroll to bottom on mint */}
      <div ref={mintingIndicatorRef} />
    </div>
  )
}

export default SelectCharacter
