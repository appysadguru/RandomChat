import { useEffect } from "react";
import ListGroup from 'react-bootstrap/ListGroup';

const ChatBody = props => {

    const currentUser = props.currentUser;
    const newMessage = props.newMessage;
    let lastFriendMsgTimestamp = props.lastFriendMsgTimestamp;
    const setlastFriendMsgTimestamp = props.setlastFriendMsgTimestamp;
    let tempTimestamp = lastFriendMsgTimestamp;
    let flag = false;

    const styleSettings = {
        'maxHeight':'300px',
        'overflow': 'scroll',  
        'display':'flex',
        'flexDirection':'column-reverse'
    }

    const arrayMessages = props.messages.map( obj => {
        
        let alignment;

        if (obj['Sender']['S'] !== currentUser) {
            alignment = 'text-end';
            if (flag === false){
                tempTimestamp = obj['TimestampMilliseconds']['N'];
                flag = true;
            }
        }
        return <ListGroup.Item key={obj['TimestampMilliseconds']['N']} className={alignment}> {obj['Message']['S']}</ListGroup.Item>
    })

    useEffect(() => {
        if (tempTimestamp !== lastFriendMsgTimestamp) {
            newMessage();
            setlastFriendMsgTimestamp(tempTimestamp);
        }
    });
    
    return <ListGroup style={{...styleSettings}} >{arrayMessages}</ListGroup>;
    
}

export default ChatBody;