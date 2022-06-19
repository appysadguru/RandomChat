import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useState, useRef } from 'react';
import pollDynamoDBMessages from '../Helper/pollDynamoDBMessages';
import ChatBody from './ChatBody';

async function postMessage(partitionKey, sortKey, msg, sender) {
    try {
        const payLoad = {"UserIDs": partitionKey,"TimestampMilliseconds": sortKey.toString(),"Message": msg,"Sender": sender}

        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(payLoad)
        }
        const response = await fetch('https://ay37sppvjd.execute-api.us-east-2.amazonaws.com/test/', options);
    } catch (error) {
        console.error(error);
    }
}

async function postFriendUsername(currentUser,friend) {
    try {
        const msg = {'Username': friend,'FriendUsername': currentUser}
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(msg)
        }
        const response = await fetch('https://4v8f48kd37.execute-api.us-east-2.amazonaws.com/test/', options);
    } catch (error) {
        console.error(error);
    }
}

const Chat = props => {

    const partitionKey = props.partitionKey;
    const currentUser = props.currentUser;
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
            postFriendUsername(currentUser,friend);
            timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp);
            console.log(currentUser+' is sending the first msg to '+friend+' - started polling the Messages table');
        }

        if (time % 2 !== remainder) { time = time + 1; }
        postMessage(partitionKey,time,inputText,currentUser);
    }

    if (newlyAdded === true && timerId.current === 0) {
        timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp);
        console.log('Detected the first msg from '+friend+' - started polling the Messages table');
    }

    if (isOnline === false && timerId.current !== 0 && timerId.current !== -1) {
        clearTimeout(timerId.current);
        timerId.current = -1;
        console.log(friend+ ' has gone offline - stopped polling the Messages table');
    }

      
    return (
        <Card>
            <Card.Body>
                <ChatBody messages={messages.current} lastFriendMsgTimestamp={lastFriendMsgTimestamp.current} setlastFriendMsgTimestamp={setlastFriendMsgTimestamp} currentUser={currentUser} newMessage={props.newMessage} />
            </Card.Body>
            <Card.Footer>
                <form onSubmit={onSubmit}>
                    <input required type="text" placeholder="Enter message" ref={refInput}></input>
                    <Button type='submit' variant='info'>send</Button>
                </form>
            </Card.Footer>
        </Card>
	)
}

export default Chat;