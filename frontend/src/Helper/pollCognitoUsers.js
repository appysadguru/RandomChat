import {poolData} from './userPool';
import {cognitoISP} from './cognitoISP';


export function pollCognitoUsers(mapUsers, setmapUsers, username) {

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
			let data, params, paginateToken = null, mapUsersCopy = new Map(mapUsers);
                
			do {
				params = {
					"Limit": 2,
					"UserPoolId": poolData['UserPoolId'],
					"PaginationToken": paginateToken
				};
				
				data = await pagination(params);
				paginateToken = data['PaginationToken'];

				for (let user of data['Users']) {
					mapUsersCopy.set(user["Username"], user)
				}

			} while ('PaginationToken' in data)
			
			mapUsersCopy.delete(username);
			setmapUsers(mapUsersCopy);
		
		} catch (error) {
			console.error('inside getUsers() catch');
			console.log(error);
		} 
	}

	setInterval(getUsers, 4000);
}

