import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import {pollCognitoUsers} from '../Helper/pollCognitoUsers';
import UserPool from '../Helper/userPool';

// component to signup and login the current user and to keep the user online
function FullScreenModal(props) {
    const [show, setShow] = useState(true);		// State Variable - whether to show the modal or not(boolean)
	const refInput =  useRef();		// holds the username(string)

    const onSubmit = event => {
        event.preventDefault();
        
        let username = refInput.current.value;
		const password = 'dumMy@6';		// using the same dummy password for every user(so that we don't have to ask the user to enter a password)

		UserPool.signUp(username, password, [], null, (err, data) => {
			if (err) {
                console.error('inside UserPool.signUp err block');
				console.error(err);
                alert(err.message);
			}
			else {
				// code to login

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
						console.log('Successfully logged in. About to start updating a Cognito Userpool attribute to stay online');

						// send the username, idToken,.. to App.js to use them further
						props.setCurrentUser({'user': username, 'IdToken': data['idToken']['jwtToken']});

						// send the details to start polling the Cognito database
                        pollCognitoUsers(props.mapUsers, props.setmapUsers, username, props.setCurrentUserData, data['idToken']['jwtToken']);

						// now that the user is created, close the Modal
                        setShow(false); 

						// every two seconds, keep updating an attribute to stay online
						setInterval(() => {

							const attributes = [
								new CognitoUserAttribute({ Name: "custom:lastseen", Value: 'test' }),
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
        <Modal show={show} backdrop='static' keyboard={false} size='lg' centered>
			<Modal.Header className='pb-0'>
				<ul className="list-group list-group-flush">
					<li className="list-group-item"><span className="fw-bold">RandomChat</span> lets you chat with random users</li>
					<li className="list-group-item">Enter a username and click on 'Create'<br/>
						Green dot represents online users. Gray dot represents offline users<br/>
						Blue message icon represents new messages<br/>
						Messages of the online users disappear after 5 minutes<br/>
						Use desktop for best results<br/>
						Click on a random user and start chatting !<br/>
					</li>
				</ul>
			</Modal.Header>
			<Form onSubmit={onSubmit}>
				<Modal.Body className='pt-0'>
						<Form.Group className='form-control-plaintext'>
							<Form.Label className='me-2'>Username</Form.Label>
							<Form.Control type="text" required pattern="^([a-zA-Z0-9]){3,10}$" ref={refInput} />
							<Form.Text className="text-muted">Alphanumeric 3-10 characters long</Form.Text>
						</Form.Group>
						<Button type='submit' variant='info' className='float-end mb-2'>Create</Button>
				</Modal.Body>
			</Form>
		</Modal>
    )
}

export default FullScreenModal;