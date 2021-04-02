import React, { useState } from 'react';
// import './App.css';
import { Jumbotron, Button, Spinner } from 'react-bootstrap';
import { BigNumber, ethers, Signer } from 'ethers';
import {Container} from 'react-bootstrap'
import { PostManager } from './Post'

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [waiting, setWaiting] = useState(false)
  const [signer, setSigner] = useState<Signer | null>(null)
  const [address, setAddress] = useState("")

  async function enableMetamask() {
    setWaiting(true)
    await window.ethereum.enable()
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    let currSigner = provider.getSigner()
    let address = await currSigner.getAddress()
    console.log("Got Address!")
    console.log(address)
    setAddress(address)
    setSigner(currSigner)
    setWaiting(false)
  }

  let element = <></>
  let post = <></>
  if (waiting) {
    element = <Spinner animation="border" role="status"></Spinner>
  } else if (signer == null) {
    element = <Button onClick={async () => {await enableMetamask()}}>
      Connect Wallet
    </Button>
  } else {
    element = <p>User Address: {address}</p>
    post = <PostManager id={BigNumber.from(4)} signer={signer}></PostManager>
  }

  return (
    <div className="App">
      <Container>
      <Jumbotron>
        <h1>Tree Chan Frontend</h1>
        {element}
      </Jumbotron>
      {post}
      </Container>
    </div>
  );
}

export default App;
