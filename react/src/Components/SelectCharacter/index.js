import React, { useEffect, useState } from 'react'
import './SelectCharacter.css'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants'
import myEpicGame from '../../utils/MyEpicGame.json'
import LoadingIndicator from '../LoadingIndicator'

const SelectCharacter = ({ setCharacterNFT }) => {
  // Hold ALL of our character metadata from the contract
  const [characters, setCharacters] = useState([])

  // We will use our gameContract in multiple places in our app
  // so let's put it into state
  // now we have access to all the functions in the contract
  const [gameContract, setGameContract] = useState(null)

  const [mintingCharacter, setMintingCharacter] = useState(false)

  // Actions
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        // Show our loading indicator
        setMintingCharacter(true)
        // console.log('Minting character in progress...')
        const mintTxn = await gameContract.mintCharacterNFT(characterId)
        await mintTxn.wait()
        // console.log('mintTxn:', mintTxn)
        // Hide our loading indicator when minting is finished
        setMintingCharacter(false)
      }
    } catch (error) {
      // console.warn('MintCharacterAction Error:', error)
      alert("Sorry, we've encounted an error. Please refresh the page and try again.")
      // If there is a problem, hide the loading indicator as well
      setMintingCharacter(false)
    }
  }

  // Render Methods
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

  // Generate our gameContract object
  useEffect(() => {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer)

      // NOW CONNECT TO THE BLOCKCHAIN! COOL!
      // and Set our gameContract in state.
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
        alert('Sorry, something went wrong fetching characters. Please refresh the page and try again.')
      }
    }

    // Add a callback method that will fire when this event
    // (i.e. when the button to mint an NFT) is received
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      // console.log(
      //   `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      // )

      // Once our character NFT is minted we can fetch the metadata from our contract
      // and set it in state to move onto the Arena
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT()
        console.log('CharacterNFT: ', characterNFT)
        setCharacterNFT(transformCharacterData(characterNFT))
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
  }, [gameContract, setCharacterNFT])

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
    </div>
  )
}

export default SelectCharacter
