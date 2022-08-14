import {poolData} from './userPool';


// get all the users from the Cognito table
export function pollCognitoUsers(mapUsers, setmapUsers, username, setCurrentUserData, IdToken) {

    async function getUsers() {
		try{

			// create a new 'set' object each time the data is pulled from the Cognito table
			// if the same 'set' object is used then the state variable will never trigger a render
			let data;
			let mapUsersCopy = new Map(mapUsers);
			// sending an empty string for the first iteration instead of null since null is little difficult to send. if an empty string is sent, null will be used in the backend
			let paginateToken = '';
			let response;
			const userPoolId = poolData['UserPoolId'];

			const options = {
				method: 'GET',
				headers: {'Authorization': IdToken},
			}             

			// paginate to get all the users from the Cognito table
			do {
				
				// using encodeURIComponent() to encode the pagination token
				let url = 'https://exgkz35fw7.execute-api.us-east-2.amazonaws.com/dev/?userPoolId='+userPoolId+'&paginationToken='+encodeURIComponent(paginateToken);
				
				response = await fetch(url, options);
				data = await response.json();
				
				paginateToken = data['PaginationToken'];
				
				for (let user of data['Users']) {
					// to the existing 'set' of users, add the current iteration user
					mapUsersCopy.set(user["Username"], user)
				}

			} while ('PaginationToken' in data)

			// send the current user data that contains details like when the current user is created
			setCurrentUserData(mapUsersCopy.get(username));
			// delete the current user from the 'set' in order to prevent displaying him/her under his/her own list of 'Users'
			mapUsersCopy.delete(username);
			// send the 'set' of users to save as a state variable
			setmapUsers(mapUsersCopy);
		
		} catch (error) {
			console.error('inside getUsers() catch');
			console.log(error);
		} 
	}

	// every 4 seconds, poll the Cognito table and get the users
	setInterval(getUsers, 4000);
}

