import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import {pollCognitoUsers} from '../Helper/pollCognitoUsers';
import UserPool from '../Helper/userPool';

function FullScreenModal(props){
    const [show, setShow] = useState(true);

    const onSubmit = event => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
		const password = 'dumMy@6';

		UserPool.signUp(username, password, [], null, (err, data) => {
			if (err) {
                console.error('inside UserPool.signUp err block');
				console.error(err);
                alert(err.message);
			}
			else {
				// code for login

				console.log('Successfully signed up. About to login');
					
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
						console.log('Successfully logged in. About to start updating a Cognito Userpool attribute to keep myself online');

						props.setCurrentUser({'user': username, 'IdToken': data['idToken']['jwtToken']});
                        pollCognitoUsers(props.mapUsers, props.setmapUsers, username);
                        setShow(false);

						setInterval(() => {

							const attributes = [
								new CognitoUserAttribute({ Name: "custom:lastseen2", Value: 'test' }),
							];
						
							user.updateAttributes(attributes, (err, result) => {
						 		if (err) {
									console.error('Failed to update the attribute');
									console.log(err);
								}
							});
                        }, 2000);
					},
					onFailure: err => {
						console.error('Failed to login');
						console.error(err);
                        alert(err.message);
					},
					newPasswordRequired: data => {
						console.error('This will never execute. newPasswordRequired: ', data)
					}
				});
			}
		});
	}

	return (
        <>
            <Modal show={show} backdrop='static' keyboard={false} size='lg' centered>
                <Modal.Header>
                    <Modal.Title>Create User</Modal.Title>
                </Modal.Header>
                <form onSubmit={onSubmit}>
                    <Modal.Body>
                            <label htmlFor='username'>Username</label>
                            <input required id='username' pattern="^([a-zA-Z0-9]){3,10}$" title="alphanumeric characters min-length:3 max-length:10"></input>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type='submit' variant='info'>Create</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}

export default FullScreenModal;