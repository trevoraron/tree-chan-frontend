import React, { useEffect, useState } from 'react';
import { BigNumber, ethers, Signer } from 'ethers';
import { Col, Row, Form, Button, Collapse, Container } from 'react-bootstrap'
import { ContractAddress, ContractMethods } from './Constants';
import { NewMessage } from './NewMessage';
import { Post } from './Post';


type PostManagerProps = {
    id: BigNumber 
    signer: Signer
}
function PostManager(props: PostManagerProps) {
    const [id, updateMainID] = useState(props.id)
    const [maxID, updateMaxID] = useState(props.id)
    const [parents, updateParents] = useState<BigNumber[]>([])
    const [replies, updateReplies] = useState<BigNumber[]>([])
    const [ownedPosts, updateOwnedPosts] = useState<BigNumber[]>([])

    useEffect(() =>  {
        let contract = new ethers.Contract(
            ContractAddress,
            ContractMethods,
            props.signer
        )
        const fetchData = async () => {
            console.log("Fetching Data")
            let maxNFTs = await contract.totalSupply()
            updateMaxID(maxNFTs)
            console.log(maxNFTs.toString())
            let curParents = await contract.getParents(id)
            updateParents(curParents)
            let curReplies = await contract.getBranches(id)
            updateReplies(curReplies)
            let address = await props.signer.getAddress()
            let balanceOf = await contract.balanceOf(address)
            let tempOwnedPosts: BigNumber[] = []
            for (let i = BigNumber.from(0); i.lt(balanceOf); i = i.add(BigNumber.from(1))) {
                tempOwnedPosts.push(await contract.tokenOfOwnerByIndex(address, i))
            }
            updateOwnedPosts(tempOwnedPosts)
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
        let num = BigNumber.from(data)
        if (num.gt(maxID)) {
            return
        }
        updateMainID(num)
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
        <div className="pb-3">
        <NewMessage signer={props.signer} updateID={updateMainID} createNewFunction={newThread} name="New Thread"/>
        </div>
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
        <div className="pb-3">
            <h3>Current Post</h3>
            <Post id={id} signer={props.signer} updateID={updateMainID}></Post>
        </div>
        <div className="pb-3">
            <MakeCollapse posts={replies.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)} title="Replies"></MakeCollapse>
        </div>
        <div className="pb-3">
            <MakeCollapse posts={ownedPosts.map(p => <Post id={p} signer={props.signer} updateID={updateMainID}></Post>)} title="My Posts"></MakeCollapse>
        </div>
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