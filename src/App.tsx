import React, { useState } from 'react';
// import './App.css';
import { Jumbotron, Button, Spinner } from 'react-bootstrap'

function App() {
  const [waiting, setWaiting] = useState(false)

  let element = <Spinner animation="border" role="status"></Spinner>
  if (!waiting) {
    element = <Button onClick={async () => {setWaiting(true)}}>
        Connect Wallet
      </Button>
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
