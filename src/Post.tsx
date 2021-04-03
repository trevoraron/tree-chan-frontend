import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { BigNumber, ethers, Signer} from 'ethers';
import { Card } from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';
import { NewMessage } from './NewMessage';

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

    function makePrimary() {
        props.updateID(props.id)
    }

    function newComment(message: string) {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        return contract.comment(props.id, message)
    }

    let messageDisplayed = <Spinner animation="border" role="status"></Spinner>
    if(message !== "") {
        messageDisplayed = <>
            <Card.Subtitle>Owner: {owner}</Card.Subtitle>
            <Card.Text>{message}</Card.Text>
        </>
    }

    return (
        <Card>
        <Card.Body>
            <Card.Title>Post #{props.id.toString()}</Card.Title>
            {messageDisplayed}
            <NewMessage signer={props.signer} updateID={props.updateID} createNewFunction={newComment} name="New Comment"/>
            <Button variant="secondary" onClick={() => makePrimary()}>Make Primary</Button>
        </Card.Body>
        </Card>
    )
}

export {Post};