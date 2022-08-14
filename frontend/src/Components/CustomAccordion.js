import { useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Friend from './Friend';

// http GET call to the API Gateway to get the users/friends who have paired with the current user(sort keys of the current user from the DynamoDB 
// 'RandomChat-Friends' table)
async function getPairedUsers(Username,setPairedUsers,IdToken) {
	try {
		const options = {
			method: 'GET',
			headers: {'Authorization': IdToken},
		}
		const response = await fetch('https://e6a3psxox5.execute-api.us-east-2.amazonaws.com/dev/?Username='+Username, options);
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

async function timeUTC(setCurrentUTC) {
	try {
		const response = await fetch('https://1pb8pbfss1.execute-api.us-east-2.amazonaws.com/dev/');
		setCurrentUTC(await response.json());
	} catch (error) {
		console.error(error);
		alert('error getting the UTC time');
	}
}

// component to get the paired users/friends and an array of online users/friends
const CustomAccordion = props => {

	const currentUser = props.currentUser;
	const currentUserData = props.currentUserData;
	
	const IdToken = props.IdToken;
	const mapUsers = props.mapUsers;

	const pairedUsers = useRef(new Map());
	const currentUTC = useRef();

	const setPairedUsers = value => {
		pairedUsers.current = value;
	}

	const setCurrentUTC = value => {
		currentUTC.current = value;
	}

	timeUTC(setCurrentUTC);

	// after the current user is created, get the paired users/friends(users who have sent the first msg)
	if (currentUser) { getPairedUsers(currentUser, setPairedUsers, IdToken) }
	
	const arrayUsernames = Array.from(mapUsers.keys());		// array of all the usernames present in the Cognito table
	const boolFalse = false;	// represents whether a online user/friend has sent the first msg

	const arrayUsers = [];

	if (currentUserData) {
		const currentUserUserCreateDate = Date.parse(currentUserData['UserCreateDate']);	// get when the current user is created

		arrayUsernames.forEach((username, index, arr) => {

			// get the last modified datetime of each friend/user
			const currentFriendLastModifiedDate = Date.parse(mapUsers.get(username)['UserLastModifiedDate']);

			const timeDiff = currentUserUserCreateDate - currentFriendLastModifiedDate;
			
			// if the time gap between the last modified datetime of a friend and the current user created datetime is more than a minute and a half then 
			// don't show the user under the list of 'Users'
			if (timeDiff < 90001)
				arrayUsers.push(<Friend key={username} friend={username} currentUser={currentUser} IdToken={IdToken} data={mapUsers.get(username)} newlyAdded={ pairedUsers.current.get(username) || boolFalse } currentUTC={currentUTC.current} />);
		});
	}
	
    return <Accordion>{arrayUsers}</Accordion>
}


export default CustomAccordion;