import React, { useEffect, useState } from 'react';
import { BigNumber, ethers, Signer } from 'ethers';
import { Col, Row, Form} from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';
import { Card, Spinner, Button } from 'react-bootstrap'
import { Post } from './Post';


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

    function handleSubmit(event: any) {
        event.preventDefault();
    }

    function onChange(event: any) {
        let data = parseInt(event.target.value)
        if (!data) {
            return
        }
        if (data <= 0) {
            return
        }
        updateMainID(BigNumber.from(data))
    }

    return <>
        <NewThread signer={props.signer} updateID={updateMainID}></NewThread>
        &nbsp;
        <Form onSubmit={handleSubmit}>
            <Form.Group as={Row}>
            <Col sm={2}>
                <h3> Post Num: </h3>
            </Col>
            <Col sm={2}>
                <Form.Control type="number" value={id.toNumber()} onChange={onChange}/>
            </Col>
            </Form.Group>
        </Form>
        <h3>Parents</h3>
        {parents.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)}
        <h3>Post</h3>
        <Post id={id} signer={props.signer} updateID={updateMainID}></Post>
        <h3>Replies</h3>
        {replies.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)}
    </>
}

type NewThreadProps = {
    signer: Signer
    updateID: React.Dispatch<React.SetStateAction<BigNumber>>
}
function NewThread(props: NewThreadProps) {
    const [sendingTx, setSendingTx] = useState(false)
    const [comment, setComment] = useState("")

    function handleSubmit(event: any) {
        event.preventDefault();
    }

    async function newThread() {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        const tx = await contract.newThread(comment)
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
        commentBox = <Spinner animation="border" role="status"></Spinner>
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>New Thread</Card.Title>
                {commentBox}
                <Button variant="primary" onClick={async () => {await newThread()}}>NewThread</Button>
            </Card.Body>
        </Card>
    )

}

export {PostManager};