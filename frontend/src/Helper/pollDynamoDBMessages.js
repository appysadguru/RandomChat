

function pollDynamoDBMessages(partitionKey, loadMessages, setlastMsgTimestamp) {

    async function getMessages() {
        try {
            const response = await fetch('https://ay37sppvjd.execute-api.us-east-2.amazonaws.com/test/?UserIDs='+partitionKey);
            const data = await response.json();
            
            loadMessages(data);
            if (data.length > 0){
                setlastMsgTimestamp(data[data.length - 1]['TimestampMilliseconds']['N']);
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    return setInterval(getMessages, 1000);
}

export default pollDynamoDBMessages;