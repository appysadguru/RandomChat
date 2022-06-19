import React, {useState, useRef} from 'react'
import FullScreenModal from './Components/FullScreenModal'
import CustomAccordion from './Components/CustomAccordion'

	
function App() {

	const [mapUsers, setmapUsers] = useState(new Map());
	const currentUser =  useRef();

	const setCurrentUser = value => {
		currentUser.current = value;
	}

	return (
		<div className="container">
			<h1>{currentUser.current}</h1>
			<br />
			<FullScreenModal setmapUsers={setmapUsers} mapUsers={mapUsers} setCurrentUser={setCurrentUser}/>
			<CustomAccordion mapUsers={mapUsers} currentUser={currentUser.current}/>
		</div>
	)
}

export default App;