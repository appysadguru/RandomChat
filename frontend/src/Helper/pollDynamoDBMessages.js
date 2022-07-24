

function pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp, IdToken) {

    async function getMessages() {
        try {
            const options = {
                method: 'GET',
                headers: {'Authorization': IdToken},
            }
            const response = await fetch('https://hxhzkavpik.execute-api.us-east-2.amazonaws.com/dev/?UserIDs='+partitionKey, options);
            const data = await response.json();
            
            loadMessages(data);
            if (data.length > 0){
                setlastMsgTimestamp(data[0]['TimestampMilliseconds']['N']);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    return setInterval(getMessages, 1000);
}

export default pollDynamoDBMessages;