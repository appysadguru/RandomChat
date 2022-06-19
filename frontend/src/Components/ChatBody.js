import { useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';

const ChatBody = props => {

    const currentUser = props.currentUser;
    const newMessage = props.newMessage;
    let lastFriendMsgTimestamp = props.lastFriendMsgTimestamp;
    const setlastFriendMsgTimestamp = props.setlastFriendMsgTimestamp;
    let tempTimestamp = lastFriendMsgTimestamp;

    const arrayMessages = props.messages.map( obj => {
        
        if (obj['Sender']['S'] !== currentUser) {
            tempTimestamp = obj['TimestampMilliseconds']['N'];
        }
        return <ListGroup.Item key={obj['TimestampMilliseconds']['N']} > {obj['Message']['S']}</ListGroup.Item>
    })

    useEffect(() => {
        if (tempTimestamp !== lastFriendMsgTimestamp) {
            newMessage();
            setlastFriendMsgTimestamp(tempTimestamp);
        }
    });
    
    return <ListGroup>{arrayMessages}</ListGroup>;
}

export default ChatBody;