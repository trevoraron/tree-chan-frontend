import React, { useEffect, useState } from 'react';
import { BigNumber, ethers, Signer } from 'ethers';
import { Col, Row, Form, Button, Collapse } from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';
import { NewMessage } from './NewMessage';
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

    function newThread(message: string) {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        return contract.newThread(message)
    }

    return <>
        <NewMessage signer={props.signer} updateID={updateMainID} createNewFunction={newThread} name="New Thread"/>
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
        <MakeCollapse posts={parents.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)} title="Parents"></MakeCollapse>
        <h3>Post</h3>
        <Post id={id} signer={props.signer} updateID={updateMainID}></Post>
        <MakeCollapse posts={replies.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)} title="Replies"></MakeCollapse>
    </>
}

function MakeCollapse(props: {posts: JSX.Element[], title: string}) {
    const [open, setOpen] = useState(true);

    // Don't render anything if empty
    if (props.posts.length === 0) {
        return <></>
    }
 
    let buttonName = open ? "Collapse": "Expand"
    return (
      <>
      <Row>
        <Col>
            <h3>{props.title}</h3>
        </Col>
        <Col>
            <Button
                onClick={() => setOpen(!open)}
                aria-controls={props.title}
                aria-expanded={open}
            >
                {buttonName}
            </Button>
        </Col>
    </Row>
    <Collapse in={open}>
        <div>
        {props.posts}
        </div>
    </Collapse>
      </>
    );
}

export { PostManager };