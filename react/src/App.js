import React, { useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import './App.css'
import SelectCharacter from './Components/SelectCharacter'

// Constants
const TWITTER_HANDLE = '_buildspace'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {
  // A state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState(null)

  const [characterNFT, setCharacterNFT] = useState(null)

  // We run this on component load
  const checkIfWalletIsConnected = async () => {
    try {
      // First check to make sure we have access to window.ethereum
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have MetaMask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)

        // Check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts' })

        // User can have multiple authorized accounts, we grab the first one if its there!
        if (accounts.length !== 0) {
          const account = accounts[0]
          console.log('Found an authorized account:', account)
          setCurrentAccount(account)
        } else {
          console.log('No authorized account found')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Render Methods
  const renderContent = () => {
    // Scenario #1
    if (!currentAccount) {
      return (
        <div className='connect-wallet-container'>
          <img src='https://i.imgur.com/2GIj41D.jpeg' alt='Dwight Club' />
          <button className='cta-button connect-wallet-button' onClick={connectWalletAction}>
            Connect Wallet To Get Started
          </button>
        </div>
      )
      // Scenario #2
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    }
  }

  // Implement your connectWallet method here
  // A user needs to explicitly tell MetaMask that it should give the frontend
  // access to their wallet.
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
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className='App'>
      <div className='container'>
        <div className='header-container'>
          <p className='header gradient-text'>⚔️ Dwight Club ⚔️</p>
          <p className='sub-text'>The first rule of Dwight Club is: you do not talk about Dwight Club!</p>

          {renderContent()}
        </div>
        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
