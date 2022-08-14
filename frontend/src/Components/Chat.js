import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import ChatBody from './ChatBody';
import pollDynamoDBMessages from '../Helper/pollDynamoDBMessages';

// http POST call to the API Gateway to create a msg in the DynamoDB 'RandomChat-Messages' table
async function postMessage(partitionKey,sortKey,msg,sender,friend,IdToken) {
    try {
        const payLoad = {"UserIDs": partitionKey,"TimestampMilliseconds": sortKey.toString(),"Message": msg,"Sender": sender}

        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8','Authorization': IdToken},
            body: JSON.stringify(payLoad)
        }
        const response = await fetch('https://avxrwu7bs9.execute-api.us-east-2.amazonaws.com/dev/', options);
    } catch (error) {
        console.log('inside postMessage fn');
        console.error(error);
        alert(`Issue detected while sending the message - ${msg} to ${friend}`)
    }
}

// http POST call to the API Gateway to create the current user as a sort key of this friend in the DynamoDB 'RandomChat-Friends' table
// all sort keys of a user in the 'RandomChat-Friends' table are considered as paired users
// if a user is paired then it could mean, the user has sent the first msg.
// once the first msg is detected, the current user should start polling the database for getting the further msgs
async function postFriendUsername(currentUser,friend,IdToken) {
    try {
        const msg = {'Username': friend,'FriendUsername': currentUser}
        const options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8','Authorization': IdToken},
            body: JSON.stringify(msg)
        }
        const response = await fetch('https://e6a3psxox5.execute-api.us-east-2.amazonaws.com/dev/', options);
    } catch (error) {
        console.log('inside postFriendUsername fn');
        console.error(error);
    }
}

// component to send and pull msgs, create paired users, to detect first msg and offline users,..
const Chat = props => {

    const partitionKey = props.partitionKey;
    const currentUser = props.currentUser;
    const IdToken = props.IdToken;
    const friend = props.friend;
    const remainder = props.remainder;
    const newlyAdded = props.newlyAdded;
    const isOnline = props.isOnline;
    
    // State variable - change in lastMsgTimestamp value implies there is a new msg to render/show. the new message could be from the current
    // user or from the friend on the other side. So, this is not just about detecting new msgs from the friend on the other side.
    // it is about detecting new msgs from both the sides
    const [lastMsgTimestamp, setlastMsgTimestamp] = useState(0);    

    // stores the timer ID received from setInterval to poll the database for msgs
    // value 0 represents the polling is not yet started
    // value > 0 represents the polling has started
    // value -1 represents the polling has stopped
    const timerId =  useRef(0);
    const messages = useRef([]);
    const refInput =  useRef();
    
    // determines if there is a new msg from the friend on the other side
    const lastFriendMsgTimestamp = useRef('');

    const loadMessages = data => messages.current = data

    // called by ChatBody to notify about a new msg from this friend
    const setlastFriendMsgTimestamp = timestamp => {
        lastFriendMsgTimestamp.current = timestamp;
    }

    async function onSubmit(event) {
        try {
            event.preventDefault();

            let inputText = refInput.current.value;
            refInput.current.value = '';
            
            const response = await fetch('https://1pb8pbfss1.execute-api.us-east-2.amazonaws.com/dev/');
            let time = await response.json();   // UTC epoch time

            // each time a msg is entered, check if the polling has started
            // if the polling has not started then this must be the first msg. do the following 2 steps:
            // 1. In order to let the friend on the other side know that the current user is going to send the first msg and for him/her to start 
            // polling the database, create the current user as a sort key of that friend. this is done by calling postFriendUsername function 
            // to create paired users.
            // 2. start polling the database
            if (timerId.current === 0) {
                postFriendUsername(currentUser,friend,IdToken);
                timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken);
                console.log(`${currentUser} is sending the first msg to ${friend} - started polling the DynamoDB RandomChat-Messages table`);
            }
    
            // the timestamp of the msgs sent from the user with higher username(alphabetical order), should be odd numbers
            // for a chat between two users, the timestamp of the msgs of one person will be odd numbers and for the another user, they will be
            // even numbers. timestamp of the messages is part of the primary key in the DynamoDB 'RandomChat-Messages' table.
            // with this even-odd logic, even if both the users send the msgs at the same instant, their timestamps will be different and therefore
            // there won't be a problem with the uniqueness in the database table. This is extremely rare scenario which I didn't find till now.
            if (time % 2 !== remainder) { time = time + 1; }
    
            postMessage(partitionKey,time,inputText,currentUser,friend,IdToken);

        } catch(error) {
            console.error(error);
            alert('error sending the message');
        }
    }

    // first msg is detected from this friend and if the polling has not started, start it
    if (newlyAdded === true && timerId.current === 0) {
        timerId.current = pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken);
        console.log(`Detected the first msg from ${friend} - started polling the DynamoDB RandomChat-Messages table`);
    }

    // with this friend, the current user had a chat and the friend has gone offline and the polling is still running. So, stop it by 
    // storing -1
    if (isOnline === false && timerId.current !== 0 && timerId.current !== -1) {
        clearTimeout(timerId.current);
        timerId.current = -1;
        console.log(`${friend} has gone offline - stopped polling the DynamoDB RandomChat-Messages table`);
    }

      
    return (
        <Card>
            <Card.Body>
                <ChatBody messages={messages.current} lastFriendMsgTimestamp={lastFriendMsgTimestamp.current} setlastFriendMsgTimestamp={setlastFriendMsgTimestamp} currentUser={currentUser} newMessage={props.newMessage} />
            </Card.Body>
            <Card.Footer>
                <Form onSubmit={onSubmit}>
                    <Form.Group className='form-control-plaintext'>
                        <Form.Control required type="text" placeholder="Enter message" ref={refInput} maxLength={1000} />
                    </Form.Group>
                    <Button type='submit' variant='info' disabled={isOnline ? "" : "disabled"} >send</Button>
                </Form>
            </Card.Footer>
        </Card>
	)
}

export default Chat;
