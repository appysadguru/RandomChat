import Accordion from 'react-bootstrap/Accordion';
import { useRef } from "react";

const Friend = props => {

    // const currentUser = props.currentUser;
    const friend = props.friend;
    const data = props.data;

    const accordionItem =  useRef();
    // const partitionKey =  useRef((currentUser < friend) ? currentUser + '--' + friend : friend + '--' + currentUser);
    
    const timeSinceLastUpdate = new Date() - data['UserLastModifiedDate'];
    const isOnline = (timeSinceLastUpdate > 90000) ? false : true;
    const colors = isOnline ? {backgroundColor: '#2ECC71'} : {backgroundColor: '#ABB2B9'};
    // if (accordionItem.current) { const isCollapsed = accordionItem.current.querySelector('button').getAttribute('aria-expanded');}
        
    return (
		<Accordion.Item eventKey={friend} style={colors} ref={accordionItem}>
            <Accordion.Header>{friend}</Accordion.Header>
            <Accordion.Body>Lorem</Accordion.Body>
        </Accordion.Item>
	)
}

export default Friend;