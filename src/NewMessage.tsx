
import React, { useState } from 'react';
import { BigNumber, ethers, Signer } from 'ethers';
import { Form} from 'react-bootstrap'
import { ContractMethods } from './Constants';
import { Spinner, Button, Container } from 'react-bootstrap'

type NewMessageProps = {
    signer: Signer
    updateID: React.Dispatch<React.SetStateAction<BigNumber>>
    createNewFunction: (message: string) => any
    name: string
}
function NewMessage(props: NewMessageProps) {
    const [sendingTx, setSendingTx] = useState(false)
    const [comment, setComment] = useState("")

    function handleSubmit(event: any) {
        event.preventDefault();
    }

    async function newThread() {
        const tx = await props.createNewFunction(comment)
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

    let commentBox = (
        <Form onSubmit={handleSubmit}>
            <Form.Control as="textarea" rows={2} value={comment} onChange={(e) => setComment(e.target.value)}/>
        </Form>
    )
    if(sendingTx) {
        commentBox = <Container><Spinner animation="border" role="status"></Spinner>&nbsp;</Container>
    }

    return (
        <>
            {commentBox}
            &nbsp;
            <Button variant="primary" onClick={async () => {await newThread()}}>{props.name}</Button>
        </>
    )

}

export { NewMessage };