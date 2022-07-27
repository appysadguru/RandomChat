import React, {useState, useRef} from 'react';
import FullScreenModal from './Components/FullScreenModal';
import CustomAccordion from './Components/CustomAccordion';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import './customStyle.css';

	
function App() {

	const [mapUsers, setmapUsers] = useState(new Map());
	const currentUser =  useRef();
	const IdToken =  useRef();

	const setCurrentUser = value => {
		currentUser.current = value['user'];
		IdToken.current = value['IdToken'];
	}



	return (
		<>
			<Card>
				<Card.Header className="card text-center"><h1>RandomChat</h1></Card.Header>
				<Card.Body>
					<Card.Title><h3>{currentUser.current}</h3></Card.Title>
					<div className="container">
						<h6>Users:</h6>
						<br />
						<FullScreenModal setmapUsers={setmapUsers} mapUsers={mapUsers} setCurrentUser={setCurrentUser} />
						<CustomAccordion mapUsers={mapUsers} currentUser={currentUser.current} IdToken={IdToken.current} />
					</div>
				</Card.Body>
			</Card>
			
			<a href="https://consciousplanet.org/" target="_blank" rel="noopener noreferrer" title="Global movement to save soil from extinction">
				<Image src={'https://randomchatbucket.s3.us-east-2.amazonaws.com/SaveSoil.png'} className="imageCSS" />
			</a>
		</>
	)
}

export default App;