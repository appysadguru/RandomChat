
const TableHeader = () => {
    
    return (
		<thead>
			<tr>
				<th>Name</th>
				<th>Last Updated</th>
			</tr>
		</thead>
	)
}

const TableBody = props => {
	
	const mapUsers = props.mapUsers
	const arrayUsernames = Array.from(mapUsers.keys());

	const arrayUsers = arrayUsernames.map(username => 
		<tr key={username}>
			<td>{username}</td>
			<td>{mapUsers.get(username)['UserStatus']}</td>
		</tr>
	);

	return <tbody>{arrayUsers}</tbody>
}

const Table = props => {
	
	return (
		<table>
			<TableHeader />
			<TableBody mapUsers={props.mapUsers}/>
		</table>		
	)
}

export default Table;

