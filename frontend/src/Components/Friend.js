import { useState, useRef } from "react";
import Accordion from 'react-bootstrap/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCircle } from '@fortawesome/free-solid-svg-icons';
import Chat from './Chat';

// component to display each user/friend, to calculate variables and to notify new msgs
const Friend = props => {

    const currentUser = props.currentUser;
    const IdToken = props.IdToken;
    const friend = props.friend;
    const data = props.data;
    const currentUTC = props.currentUTC;

    const [newMsgVisibility, setnewMsgVisibility] = useState('invisible');      // State Variable - to display the new msg blue icon(string)
    
    const accordionItem =  useRef();
    const isOnline =  useRef(currentUTC - Date.parse(data['UserLastModifiedDate']));


    // calculate the partition key for the current user and the current friend. used to store msgs in the DynamoDB 'RandomChat-Messages' table
    // compare the usernames alphabetically and create the partition key
    // example
    // current user's username: user1   current friend's username: user2
    // partition key -> user1--user2
    // even if this is calculated on the current friend's side, the same partition key value will be generated
    const partitionKey =  useRef((currentUser < friend) ? currentUser + '--' + friend : friend + '--' + currentUser);

    // saving the alphabetical order of the usernames as 0 or 1 in order to further use it in slightly modifying the timestamp of each msg
    const remainder =  useRef((currentUser < friend) ? 0 : 1);
    
    if (isOnline.current !== false) {
        const timeSinceLastUpdate = currentUTC - Date.parse(data['UserLastModifiedDate']);
        
        // if it has been more than a minute and a half since the current friend's 'UserLastModifiedDate' value has changed then consider him as offline
        isOnline.current = (timeSinceLastUpdate > 90000) ? false : true;
    }

    // whenever the collapsible is clicked, check if the blue icon is visible and if yes, make it invisible(because the collapsible is going 
    // to be opened and the new msgs will be read)
    const Clicked = event => {
        const isExpanded = accordionItem.current.querySelector('button').getAttribute('aria-expanded');
        if (isExpanded === 'false' && newMsgVisibility === 'visible') {    setnewMsgVisibility('invisible') }
    } 

    // this is called by component ChatBody to notify new msgs and to make the blue icon visible if the collapsible is closed
    function newMessage () {
        const isExpanded = accordionItem.current.querySelector('button').getAttribute('aria-expanded');
        if (isExpanded === 'false') {   setnewMsgVisibility('visible')   }
    }

    
        
        
    return (
        <Accordion.Item eventKey={friend} ref={accordionItem} >
            <Accordion.Header onClick={Clicked} className='text-right'>
                {friend} 
                <div className='custom-space' ></div>
                <FontAwesomeIcon icon={faEnvelope} color="blue" className={newMsgVisibility} />
                <FontAwesomeIcon icon={faCircle} color={isOnline.current ? '#2ECC71' : '#ABB2B9'} className='mx-5' />
            </Accordion.Header>
            <Accordion.Body>
                <Chat isOnline={isOnline.current} partitionKey={partitionKey.current} remainder={remainder.current} newlyAdded={props.newlyAdded} currentUser={currentUser} IdToken={IdToken} friend={friend} newMessage={newMessage} />
            </Accordion.Body>
        </Accordion.Item>
	)
}

export default Friend;