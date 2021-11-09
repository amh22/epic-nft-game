import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, transformCharacterData } from './constants'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'
import SelectCharacter from './Components/SelectCharacter'
import myEpicGame from './utils/MyEpicGame.json'
import Arena from './Components/Arena'
import LoadingIndicator from './Components/LoadingIndicator'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

// Constants
const TWITTER_HANDLE = 'andrewmhenry22'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {
  const [correctNetwork, setCorrectNetwork] = useState(false)

  // A state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState(null)

  const [characterNFT, setCharacterNFT] = useState(null)
  console.log('🚀 ~ file: App.js ~ line 24 ~ App ~ characterNFT', characterNFT)

  const [isLoading, setIsLoading] = useState(false)

  // We run this on component load
  const checkIfWalletIsConnected = async () => {
    try {
      // First check to make sure we have access to window.ethereum
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have MetaMask!')
        return
      } else {
        // console.log('We have the ethereum object', ethereum)

        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' })

        // User can have multiple authorized accounts, we grab the first one if its there!
        if (accounts.length !== 0) {
          const account = accounts[0]
          // console.log('Found an authorized account:', account)
          setCurrentAccount(account)
        } else {
          console.log('No authorized account found')
        }
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    // console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4'
    if (chainId !== rinkebyChainId) {
      // alert('You are not connected to the Rinkeby Test Network!')
      setCorrectNetwork(false)
    } else setCorrectNetwork(true)
  }

  // Render Methods
  const renderContent = () => {
    //  If the app is currently loading, just render out LoadingIndicator
    if (isLoading) {
      return <LoadingIndicator />
    }

    // Scenario #1: Does User have a wallet connected?
    if (!currentAccount) {
      return (
        <div className='connect-wallet-container'>
          <img
            src={`https://cloudflare-ipfs.com/ipfs/Qmd8G2boWJDUxA3DRneuYPL4F44X1XoFRZYxv4gx7gWj7q`}
            alt='Dwight Club'
          />
          <button className='cta-button connect-wallet-button' onClick={connectWalletAction}>
            Connect Wallet To Get Started
          </button>
        </div>
      )
      // Scenario #2: If wallet is connected, but NOT on the Rinkeby Test Network
    } else if (currentAccount && !correctNetwork) {
      return (
        <div className='connect-wallet-container'>
          <img
            src={`https://cloudflare-ipfs.com/ipfs/Qmd8G2boWJDUxA3DRneuYPL4F44X1XoFRZYxv4gx7gWj7q`}
            alt='Dwight Club'
          />
          <button
            className='cta-button connect-wallet-button'
            onClick={connectWalletAction}
            disabled={!correctNetwork}
            style={{ cursor: !correctNetwork ? 'not-allowed' : 'pointer' }}
          >
            <span style={{ paddingRight: '10px' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} color='yellow' />
            </span>
            Wallet Is Connected
          </button>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',

              background: 'gray',
              padding: '0px 20px',
              margin: '10px auto',
              borderRadius: '5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <span style={{ paddingRight: '40px' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} color='yellow' size='lg' />
                </span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '18px', color: 'white' }}>
                  You need to connect your wallet to the Rinkeby Test Network.
                </p>
                <p style={{ fontSize: '18px', color: 'white' }}>Refresh this page once you've done so.</p>
              </div>
            </div>
          </div>
        </div>
      )

      // Scenario #3: If wallet is connected, , and on correct network, then let the user select a character to mint
    } else if (currentAccount && correctNetwork && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />

      // If there is a connected wallet AND characterNFT, it's time to battle!
    } else if (currentAccount && correctNetwork && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} curentAccount={currentAccount} />
    }
  }

  /* CONNECT WALLET */
  // A user needs to explicitly tell MetaMask that it should give the frontend access to their wallet.
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
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  // This runs our function when the page loads.
  useEffect(() => {
    // Anytime our component mounts, make sure to immediately set our loading state
    setIsLoading(true)
    checkIfWalletIsConnected()
    checkCorrectNetwork()
  }, [])

  /* Check WALLET is CONNECTED */
  // then check to see if the user ALREADY has minted a character and if so, display that character

  useEffect(() => {
    // The function we will call that interacts with out smart contract
    const fetchNFTMetadata = async () => {
      // console.log('Checking for Character NFT on address:', currentAccount)

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer)

      // NOW CONNECT TO THE BLOCKCHAIN! COOL! and check to see if the user has an character already by checking for the 'name'
      const characterNFT = await gameContract.checkIfUserHasNFT()

      if (characterNFT.name) {
        // console.log('characterNFT:', characterNFT)
        // console.log('User has character NFT')

        const transformCharData = transformCharacterData(characterNFT)

        const getNftId = await gameContract.getUserNftId(currentAccount)
        transformCharData['token'] = getNftId

        setCharacterNFT(transformCharData)
      } else {
        console.log('No character NFT found')
      }

      // Once we are done with all the fetching, set loading state to false
      setIsLoading(false)
    }

    // We only want to run this, if we have a connected wallet, AND user is on the CORRECT NETWORK
    if (currentAccount && correctNetwork) {
      // console.log('CurrentAccount:', currentAccount)
      fetchNFTMetadata()
    }
  }, [currentAccount, correctNetwork])

  return (
    <div className='App'>
      <div className='container'>
        <div className='header-container'>
          <div style={{ padding: '0px 20px' }}>
            <p className='header gradient-text'>⚔️ Dwight Club ⚔️</p>
            <p className='sub-text'>The first rule of Dwight Club is: you do not talk about Dwight Club!</p>
          </div>
          {!currentAccount && <p className='sub-text'>Dwight Club Members: Connect your wallet to find out!</p>}

          {renderContent()}
        </div>
        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
