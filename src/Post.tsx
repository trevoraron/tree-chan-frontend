import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { BigNumber, ethers, Signer } from 'ethers';
import {Card} from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';


type PostManagerProps = {
    id: BigNumber 
    signer: Signer
}
function PostManager(props: PostManagerProps) {
    const [id, updateMainID] = useState(props.id)
    const [parents, updateParents] = useState<BigNumber[]>([])
    const [replies, updateReplies] = useState<BigNumber[]>([])

    useEffect(() =>  {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        const fetchData = async () => {
        let curParents = await contract.getParents(id)
        let curReplies = await contract.getBranches(id)
        updateParents(curParents)
        updateReplies(curReplies)
    }
        fetchData()
    }, [id, props.signer])

    return <>
        <h1>Parents</h1>
        {parents.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)}
        <h1>Post</h1>
        <Post id={id} signer={props.signer} updateID={updateMainID}></Post>
        <h1>Replies</h1>
        {replies.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)}
    </>
}

type PostProps = {
    id: BigNumber 
    signer: Signer
    updateID: React.Dispatch<React.SetStateAction<BigNumber>>
}
  
function Post(props: PostProps) {
    const [message, setMessage] = useState("")
    const [owner, setOwner] = useState("")

    useEffect(() =>  {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
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
            <Card.Title>Post #{props.id.toString()}</Card.Title>
            {messageDisplayed}
            <Button variant="primary">Comment</Button>
            <Button variant="secondary" onClick={() => makePrimary()}>Make Primary</Button>
        </Card.Body>
        </Card>
    )
}

export {PostManager};