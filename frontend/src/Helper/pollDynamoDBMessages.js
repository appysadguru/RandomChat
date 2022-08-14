
// http GET call to the API Gateway to get the msgs from the DynamoDB 'RandomChat-Messages' table
// polling the database for a specific friend will start only under one of the two scenarios:
// 1. if the current user has decided to send the first msg to that friend
// 2. that friend has sent the first msg and that msg is detected on the current user's side

function pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken) {

    async function getMessages() {
        try {
            const options = {
                method: 'GET',
                headers: {'Authorization': IdToken},
            }
            const response = await fetch('https://avxrwu7bs9.execute-api.us-east-2.amazonaws.com/dev/?UserIDs='+partitionKey, options);
            const data = await response.json();
            
            loadMessages(data);

            if (data.length > 0){
                // send the timestamp of the latest msg to the Chat component. if it is a new value, the state variable will detect the
                // change and will lead to a render
                setlastMsgTimestamp(data[0]['TimestampMilliseconds']['N']);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    // every 1 second, check the database for msgs
    return setInterval(getMessages, 1000);
}

export default pollDynamoDBMessages;