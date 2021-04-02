import React, { useEffect, useState } from 'react';
// import './App.css';
import { Jumbotron, Button, Spinner } from 'react-bootstrap';
import { ethers, Signer } from 'ethers';
import {Container, Card} from 'react-bootstrap'

const contractAddress = "0xFc2540389af95921a8c2D8AeA3A884bf9e38cee8";
const contractMethods = [
  "function getMessage(uint256 _token) external view returns (string message)"
];

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
    post = <Post id={1} signer={signer}></Post>
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

type PostProps = {
  id: Number 
  signer: Signer
}
function Post(props: PostProps) {
  const [message, setMessage] = useState("")

  useEffect(() =>  {
    let contract = new ethers.Contract(
      contractAddress,
      contractMethods,
      props.signer
    )
    const fetchData = async () => {
      let readMessage = await contract.getMessage(props.id)
      setMessage(readMessage)
    }
    fetchData()
  }, [props.id, props.signer])

  let messageDisplayed = <Spinner animation="border" role="status"></Spinner>
  if(message !== "") {
    messageDisplayed = <Card.Text>{message}</Card.Text>
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Post #:{props.id}</Card.Title>
        {messageDisplayed}
        <Button variant="primary">Comment</Button>
      </Card.Body>
    </Card>
  )
}

export default App;
