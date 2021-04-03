import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { BigNumber, ethers, Signer} from 'ethers';
import { Card } from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';
import { Form } from 'react-bootstrap'

type PostProps = {
    id: BigNumber 
    signer: Signer
    updateID: React.Dispatch<React.SetStateAction<BigNumber>>
}
  
function Post(props: PostProps) {
    const [message, setMessage] = useState("")
    const [owner, setOwner] = useState("")
    const [comment, setComment] = useState("")
    const [sendingTx, setSendingTx] = useState(false)

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

    function handleSubmit(event: any) {
        event.preventDefault();
    }

    async function makeComment() {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        const tx = await contract.comment(props.id, comment)
        console.log(`Transaction hash: ${tx.hash}`);
        setSendingTx(true)
    
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        let iface = new ethers.utils.Interface(ContractMethods);
        let parsed = iface.parseLog(receipt.events[0]);
        let tokenID = parsed.args._tokenId
        console.log(`New Token ID: ${tokenID}`)
        setComment("")
        setSendingTx(false)
        props.updateID(tokenID)
    }

    let messageDisplayed = <Spinner animation="border" role="status"></Spinner>
    if(message !== "") {
        messageDisplayed = <>
            <Card.Subtitle>Owner: {owner}</Card.Subtitle>
            <Card.Text>{message}</Card.Text>
        </>
    }

    let commentBox = (
        <Form onSubmit={handleSubmit}>
            <Form.Control as="textarea" rows={2} value={comment} onChange={(e) => setComment(e.target.value)}/>
        </Form>
    )
    if(sendingTx) {
        commentBox = <Spinner animation="border" role="status"></Spinner>
    }


    return (
        <Card>
        <Card.Body>
            <Card.Title>Post #{props.id.toString()}</Card.Title>
            {messageDisplayed}
            {commentBox}
            <Button variant="primary" onClick={async () => {await makeComment()}}>Comment</Button>
            <Button variant="secondary" onClick={() => makePrimary()}>Make Primary</Button>
        </Card.Body>
        </Card>
    )
}

export {Post};