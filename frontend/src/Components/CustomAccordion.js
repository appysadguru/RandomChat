import Accordion from 'react-bootstrap/Accordion';
import Friend from './Friend';


const CustomAccordion = props => {
	
	const mapUsers = props.mapUsers;
	const arrayUsernames = Array.from(mapUsers.keys());

	const arrayUsers = arrayUsernames.map(username => 
		<Friend key={username} friend={username} currentUser={props.currentUser} data={mapUsers.get(username) } />
	);

    return <Accordion>{arrayUsers}</Accordion>
}


export default CustomAccordion;