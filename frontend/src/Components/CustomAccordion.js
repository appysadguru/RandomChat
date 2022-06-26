import { useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Friend from './Friend';

async function getPairedUsers(Username,setPairedUsers,IdToken) {
	try {
		const options = {
			method: 'GET',
			headers: {'Authorization': IdToken},
		}
		const response = await fetch('https://4v8f48kd37.execute-api.us-east-2.amazonaws.com/test/?Username='+Username, options);
		const data = await response.json();
	    
		const pairedUsers = new Map();
		for (const element of data) {
			pairedUsers.set(element['FriendUsername']['S'], true);
		}
		
		setPairedUsers(pairedUsers);

	} catch (error) {
		console.error(error);
	}
}

const CustomAccordion = props => {

	const currentUser = props.currentUser;
	const IdToken = props.IdToken;
	const mapUsers = props.mapUsers;

	const pairedUsers = useRef(new Map());

	const setPairedUsers = value => {
		pairedUsers.current = value;
	}

	if (currentUser) { getPairedUsers(currentUser, setPairedUsers, IdToken) }
	
	const arrayUsernames = Array.from(mapUsers.keys());
	const boolFalse = false;

	const arrayUsers = arrayUsernames.map(username => <Friend key={username} friend={username} currentUser={currentUser} IdToken={IdToken} data={mapUsers.get(username)} newlyAdded={ pairedUsers.current.get(username) || boolFalse } />
	);

    return <Accordion>{arrayUsers}</Accordion>
}


export default CustomAccordion;