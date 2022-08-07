import { useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';

// this component takes the msgs from a prop variable and populates the chat window
const ChatBody = props => {

    const currentUser = props.currentUser;
    const newMessage = props.newMessage;
    let lastFriendMsgTimestamp = props.lastFriendMsgTimestamp;
    const setlastFriendMsgTimestamp = props.setlastFriendMsgTimestamp;
    let tempTimestamp = lastFriendMsgTimestamp; // timestamp of the latest msg sent by the friend recorded during the last render
    let flag = false;

    const arrayMessages = props.messages.map( obj => {
        
        let alignment;

        if (obj['Sender']['S'] !== currentUser) {
            alignment = 'text-end';     // if the msg is from the current user, pull it to the right
            if (flag === false){
                tempTimestamp = obj['TimestampMilliseconds']['N'];      // get the timestamp of the latest msg sent by the friend
                flag = true;
            }
        }
        return <ListGroup.Item key={obj['TimestampMilliseconds']['N']} className={alignment}> {obj['Message']['S']}</ListGroup.Item>
    })

    // each time msgs are rendered, check if there is a new msg and act accordingly
    useEffect(() => {

        // if the msg is a new msg then notify Friend component in order to show the blue icon
        if (tempTimestamp !== lastFriendMsgTimestamp) {
            newMessage();
            setlastFriendMsgTimestamp(tempTimestamp);  // store the timestamp of the latest msg for comparison in the future to detect new msgs
        }
    });
    
    return <ListGroup className='style-messages' >{arrayMessages}</ListGroup>;
    
}

export default ChatBody;