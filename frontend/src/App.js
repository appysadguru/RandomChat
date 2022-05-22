import React, {useState} from 'react'
import FullScreenModal from './Components/FullScreenModal'
import Table from './Components/Table'

	
function App() {

	const [mapUsers, setmapUsers] = useState(new Map());

	return (
		<div className="container">
			<FullScreenModal setmapUsers={setmapUsers} mapUsers={mapUsers}/>
			<Table mapUsers={mapUsers} />
		</div>
	)
}

export default App;