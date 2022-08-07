const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });



function responseData(responseCode, responseBody) {

    return {
        'isBase64Encoded': false,
        'statusCode': responseCode,
        'headers': {
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store' 
        }, 
        'body': JSON.stringify(responseBody),
    };
}

// creates a user(provided as FriendUsername) as a sort key of another user(provided as Username) in the DynamoDB 'RandomChat-Friends' table
exports.handler = async (event) => {
    
    try {
        const payload = JSON.parse(event['body']);  // data sent by the front-end
        
        const partitionKey = payload['Username'];
        const sortKey = payload['FriendUsername'];
        
        const params = {
            'TableName': "RandomChat-Friends",
            'Item': {
              'Username': { 'S': partitionKey },
              'FriendUsername': { 'S': sortKey }
           },
        };

        const data = await ddbClient.send(new PutItemCommand(params));
        return responseData(data['$metadata']['httpStatusCode'], '');
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }

};

