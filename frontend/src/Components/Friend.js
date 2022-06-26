import Accordion from 'react-bootstrap/Accordion';
import { useState, useRef } from "react";
import Chat from './Chat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCircle } from '@fortawesome/free-solid-svg-icons';



const Friend = props => {

    const currentUser = props.currentUser;
    const IdToken = props.IdToken;
    const friend = props.friend;
    const data = props.data;

    const [newMsgVisibility, setnewMsgVisibility] = useState('invisible');
    
    const accordionItem =  useRef();
    const partitionKey =  useRef((currentUser < friend) ? currentUser + '--' + friend : friend + '--' + currentUser);
    const remainder =  useRef((currentUser < friend) ? 0 : 1);
    
    const timeSinceLastUpdate = new Date() - data['UserLastModifiedDate'];
    const isOnline = (timeSinceLastUpdate > 90000) ? false : true;
    const alignment = {float: 'right'};
    
    const Clicked = event => {
        const isExpanded = accordionItem.current.querySelector('button').getAttribute('aria-expanded');
        if (isExpanded === 'false' && newMsgVisibility === 'visible') {    setnewMsgVisibility('invisible') }
    } 

    function newMessage () {
        const isExpanded = accordionItem.current.querySelector('button').getAttribute('aria-expanded');
        if (isExpanded === 'false') {   setnewMsgVisibility('visible')   }
    }
        
    return (
        <Accordion.Item eventKey={friend} ref={accordionItem} >
            <Accordion.Header onClick={Clicked}>
                {friend} 
                <FontAwesomeIcon icon={faEnvelope} pull="right" color="blue" className={newMsgVisibility} />
                <FontAwesomeIcon icon={faCircle} color={isOnline ? '#2ECC71' : '#ABB2B9'} style={alignment} />
            </Accordion.Header>
            <Accordion.Body>
                <Chat isOnline={isOnline} partitionKey={partitionKey.current} remainder={remainder.current} newlyAdded={props.newlyAdded} currentUser={currentUser} IdToken={IdToken} friend={friend} newMessage={newMessage} />
            </Accordion.Body>
        </Accordion.Item>
	)
}

export default Friend;