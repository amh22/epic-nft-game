import React from 'react'
import './LoadingIndicator.css'

const LoadingIndicator = () => {
  return (
    <div className='lds-ring'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

const LoadingIndicatorBoard = () => {
  return (
    <div className='lds-ring-board'>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export { LoadingIndicator, LoadingIndicatorBoard }
