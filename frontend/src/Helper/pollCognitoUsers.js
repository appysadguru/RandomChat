import {cognitoISP} from './cognitoISP';
import {poolData} from './userPool';


// get all the users from the Cognito table
export function pollCognitoUsers(mapUsers, setmapUsers, username, setCurrentUserData) {

    function pagination(params) {
		return new Promise((resolve, reject) => {
			cognitoISP.listUsers(params, function(err, data) {
				if (err) {
                    console.error('inside pagination fn');
                    console.log(err);
                    reject(err);
                }
				else resolve(data);          
			});
		});
	}

	async function getUsers() {
		try{

			// create a new 'set' object each time the data is pulled from the Cognito table
			// if the same 'set' object is used then the state variable will never trigger a render
			// (I don't have to create a copy of the 'set' of the existing users since the users will not be deleted soon from the Cognito table.
			// later, might have to change it to keep it simple)
			let data, params, paginateToken = null, mapUsersCopy = new Map(mapUsers);
                
			// paginate to get all the users from the Cognito table
			do {
				params = {
					"Limit": 60,
					"UserPoolId": poolData['UserPoolId'],
					"PaginationToken": paginateToken
				};
				
				data = await pagination(params);
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

