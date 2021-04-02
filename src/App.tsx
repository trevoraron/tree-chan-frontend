import React, { useState } from 'react';
// import './App.css';
import { Jumbotron, Button, Spinner } from 'react-bootstrap';
import { ethers, Signer } from 'ethers';

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
  if (waiting) {
    element = <Spinner animation="border" role="status"></Spinner>
  } else if (signer == null) {
    element = <Button onClick={async () => {await enableMetamask()}}>
      Connect Wallet
    </Button>
  } else {
    element = <p>User Address: {address}</p>
  }

  return (
    <div className="App">
      <Jumbotron>
        <h1>Tree Chan Frontend</h1>
        {element}
      </Jumbotron>
    </div>
  );
}

export default App;
