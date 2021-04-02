import React, { useEffect, useState } from 'react';
// import './App.css';
import { Jumbotron, Button, Spinner } from 'react-bootstrap';
import { ethers, Signer } from 'ethers';
import {Container, Card} from 'react-bootstrap'

const contractAddress = "0xFc2540389af95921a8c2D8AeA3A884bf9e38cee8";
const contractMethods = [
  "function getMessage(uint256 _token) external view returns (string message)",
  "function ownerOf(uint256 _tokenId) external view returns (address)",
  "function getParents(uint256 _token) external view returns (uint256[] memory)",
  "function getBranches(uint256 _token) external view returns (uint256[] memory)",
  "function newThread(string memory _message) public returns (uint256)",
  "function comment(uint256 _post, string memory _message)",
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
    post = <PostManager id={4} signer={signer}></PostManager>
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

type PostManagerProps = {
  id: Number 
  signer: Signer
}
function PostManager(props: PostManagerProps) {
  const [id, updateMainID] = useState(props.id)
  const [parents, updateParents] = useState<Number[]>([])

  useEffect(() =>  {
    let contract = new ethers.Contract(
      contractAddress,
      contractMethods,
      props.signer
    )
    const fetchData = async () => {
      let curParents = await contract.getParents(id)
      console.log(curParents)
      updateParents(curParents)
    }
    fetchData()
  }, [id, props.signer])

  return <Post id={id} signer={props.signer} updateID={updateMainID}></Post>
}

type PostProps = {
  id: Number 
  signer: Signer
  updateID: React.Dispatch<React.SetStateAction<Number>>
}

function Post(props: PostProps) {
  const [message, setMessage] = useState("")
  const [owner, setOwner] = useState("")

  useEffect(() =>  {
    let contract = new ethers.Contract(
      contractAddress,
      contractMethods,
      props.signer
    )
    const fetchData = async () => {
      let readOwner = await contract.ownerOf(props.id)
      let readMessage = await contract.getMessage(props.id)
      setMessage(readMessage)
      setOwner(readOwner)
    }
    fetchData()
  }, [props.id, props.signer])

  let messageDisplayed = <Spinner animation="border" role="status"></Spinner>
  if(message !== "") {
    messageDisplayed = <>
      <Card.Subtitle>Owner: {owner}</Card.Subtitle>
      <Card.Text>{message}</Card.Text>
    </>
  }

  function makePrimary() {
    props.updateID(props.id)
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Post #:{props.id}</Card.Title>
        {messageDisplayed}
        <Button variant="primary">Comment</Button>
        <Button variant="secondary" onClick={() => makePrimary()}>Make Primary</Button>
      </Card.Body>
    </Card>
  )
}

export default App;
