import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useState, useRef } from 'react';
import pollDynamoDBMessages from '../Helper/pollDynamoDBMessages';
import ChatBody from './ChatBody';

async function postMessage(partitionKey,sortKey,msg,sender,friend,IdToken) {
    try {
        const payLoad = {"UserIDs": partitionKey,"TimestampMilliseconds": sortKey.toString(),"Message": msg,"Sender": sender}

        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8','Authorization': IdToken},
            body: JSON.stringify(payLoad)
        }
        const response = await fetch('https://hxhzkavpik.execute-api.us-east-2.amazonaws.com/dev/', options);
    } catch (error) {
        console.log('inside postMessage fn');
        console.error(error);
        alert(`Issue detected while sending the message - ${msg} to ${friend}`)
    }
}

async function postFriendUsername(currentUser,friend,IdToken) {
    try {
        const msg = {'Username': friend,'FriendUsername': currentUser}
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8','Authorization': IdToken},
            body: JSON.stringify(msg)
        }
        const response = await fetch('https://a6dh7pskhi.execute-api.us-east-2.amazonaws.com/dev/', options);
    } catch (error) {
        console.log('inside postFriendUsername fn');
        console.error(error);
    }
}

const Chat = props => {

    const partitionKey = props.partitionKey;
    const currentUser = props.currentUser;
    const IdToken = props.IdToken;
    const friend = props.friend;
    const remainder = props.remainder;
    const newlyAdded = props.newlyAdded;
    const isOnline = props.isOnline;
    
    const [lastMsgTimestamp, setlastMsgTimestamp] = useState(0);

    const timerId =  useRef(0);
    const messages = useRef([]);
    const refInput =  useRef();
    const lastFriendMsgTimestamp = useRef('');

    const loadMessages = data => messages.current = data

    const setlastFriendMsgTimestamp = timestamp => {
        lastFriendMsgTimestamp.current = timestamp;
    }

    const onSubmit = event => {
        event.preventDefault();

        let inputText = refInput.current.value
        refInput.current.value = '';

        let time =  Date.now();
        if (timerId.current === 0) {
            postFriendUsername(currentUser,friend,IdToken);
            timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken);
            console.log(currentUser+' is sending the first msg to '+friend+' - started polling the DynamoDB RandomChat-Messages table');
        }

        if (time % 2 !== remainder) { time = time + 1; }
        postMessage(partitionKey,time,inputText,currentUser,friend,IdToken);
    }

    if (newlyAdded === true && timerId.current === 0) {
        timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken);
        console.log('Detected the first msg from '+friend+' - started polling the DynamoDB RandomChat-Messages table');
    }

    if (isOnline === false && timerId.current !== 0 && timerId.current !== -1) {
        clearTimeout(timerId.current);
        timerId.current = -1;
        console.log(friend+ ' has gone offline - stopped polling the DynamoDB RandomChat-Messages table');
    }

      
    return (
        <Card>
            <Card.Body>
                <ChatBody messages={messages.current} lastFriendMsgTimestamp={lastFriendMsgTimestamp.current} setlastFriendMsgTimestamp={setlastFriendMsgTimestamp} currentUser={currentUser} IdToken={IdToken} newMessage={props.newMessage} />
            </Card.Body>
            <Card.Footer>
                {/* <form onSubmit={onSubmit}>
                    <input required type="text" placeholder="Enter message" ref={refInput} ></input>
                    <Button type='submit' variant='info' disabled={isOnline ? "" : "disabled"} >send</Button>
                </form> */}
                    <Form onSubmit={onSubmit}>
                        <Form.Group className='form-control-plaintext'>
                            <Form.Control required type="text" placeholder="Enter message" ref={refInput} />
                            {/* <Form.Text className="text-muted"></Form.Text> */}
                        </Form.Group>
                        
                        <Button type='submit' variant='info' disabled={isOnline ? "" : "disabled"} >send</Button>
                    </Form>
            </Card.Footer>
        </Card>
	)
}

export default Chat;
