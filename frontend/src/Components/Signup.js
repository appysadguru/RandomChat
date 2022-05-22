import UserPool from '../Helper/userPool'
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

const Signup = () => {
	
	const onSubmit = event => {
		event.preventDefault();

		const username = document.getElementById('username').value;
		const password = 'dumMy@6';
		
		UserPool.signUp(username, password, [], null, (err, data) => {
			if (err) {
                console.error('inside UserPool.signUp err block');
				
				console.log(typeof(err.message));
				console.log(err.message);

				console.log(typeof(err.name));
				console.log(err.name);
			}
			else {
				// code for login

				console.log('successfully signed in. about to login');
					
				const user = new CognitoUser({
					Username: username,
					Pool: UserPool
				});
				
				const authDetails = new AuthenticationDetails({
					Username: username,
					Password: password
				});
				
				user.authenticateUser(authDetails, {
					onSuccess: data => {
						console.log('successfully logged in. about to start updating the attribute');

						setInterval(() => {

							const attributes = [
								new CognitoUserAttribute({ Name: "custom:lastseen2", Value: 'test' }),
							];
						
							user.updateAttributes(attributes, (err, result) => {
						 		if (err) {
									console.error('Failed to update the attribute')
									console.log(err);
								}
								else {
									console.log('successfully updated the attribute');
						 			console.log(result);
								}
								
							});

						}, 2000);
						
					},
					onFailure: err => {
						console.error('Failed to login');
						console.log(err);
					},
					newPasswordRequired: data => {
						console.log('this will never execute. newPasswordRequired: ', data)
					}
				});
			}
		});
	}
	
	return (
		<div>
			<form onSubmit={onSubmit}>
				<label htmlFor='username'>Username</label>
				<input required id='username' minLength='3' maxLength='10'></input>
				<button type='submit'>SignUp</button>
			</form>
		</div>
	)
	
}

export default Signup;