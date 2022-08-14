import React, {useState, useRef} from 'react';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import CustomAccordion from './Components/CustomAccordion';
import FullScreenModal from './Components/FullScreenModal';
import './customStyle.css';



	
function App() {

	const [mapUsers, setmapUsers] = useState(new Map());	// State Variable - map object mapping usernames(string) of friends to Cognito data(object)
	const currentUser =  useRef();	// current user's username(string)
	const IdToken =  useRef();	// Cognito idToken(string)
	const currentUserData =  useRef();	// current user's Cognito data(object)
	
	// called by FullScreenModal component
	const setCurrentUser = value => {
		currentUser.current = value['user'];
		IdToken.current = value['IdToken'];
	}

	// called by pollCognitoUsers function
	const setCurrentUserData = value => {
		currentUserData.current = value;
	}

	return (
		<>
			<Card>
				<Card.Header className="card text-center"><h1>RandomChat</h1></Card.Header>
				<Card.Body>
					<Card.Title><h3>{currentUser.current}</h3></Card.Title>
					<br />
					<h6>Users:</h6>
					<div className="container">
						<br />
						<FullScreenModal setmapUsers={setmapUsers} mapUsers={mapUsers} setCurrentUser={setCurrentUser} setCurrentUserData={setCurrentUserData} />
						<CustomAccordion mapUsers={mapUsers} currentUser={currentUser.current} IdToken={IdToken.current} currentUserData={currentUserData.current} />
					</div>
				</Card.Body>
			</Card>
			
			<a href="https://consciousplanet.org/" target="_blank" rel="noopener noreferrer" title="Global movement to save soil from extinction">
				<Image src={'https://randomchatbucket.s3.us-east-2.amazonaws.com/SaveSoil.png'} className="image-css" />
			</a>
		</>
	)
}

export default App;