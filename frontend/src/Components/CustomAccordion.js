import { useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Friend from './Friend';

async function getPairedUsers(Username,setPairedUsers) {
	try {
		const response = await fetch('https://4v8f48kd37.execute-api.us-east-2.amazonaws.com/test/?Username='+Username);
		const data = await response.json();
	    
		const pairedUsers = new Map();

		for (const element of data) {
			pairedUsers.set(element['FriendUsername']['S'], true)
		}
		
		setPairedUsers(pairedUsers);

	} catch (error) {
		console.error(error);
	}
}

const CustomAccordion = props => {

	const currentUser = props.currentUser;
	const mapUsers = props.mapUsers;

	const pairedUsers = useRef(new Map());

	const setPairedUsers = value => {
		pairedUsers.current = value;
	}

	getPairedUsers(currentUser, setPairedUsers);
	
	const arrayUsernames = Array.from(mapUsers.keys());
	const boolFalse = false;

	const arrayUsers = arrayUsernames.map(username => <Friend key={username} friend={username} currentUser={props.currentUser} data={mapUsers.get(username)} newlyAdded={ pairedUsers.current.get(username) || boolFalse } />
	);

    return <Accordion>{arrayUsers}</Accordion>
}


export default CustomAccordion;