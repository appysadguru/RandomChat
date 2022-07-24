const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });

// 23rd July version 4

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

exports.handler = async (event) => {
    
    try {
        const payload = JSON.parse(event['body']);
        
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
        console.log('test'); // testing
        return responseData(data['$metadata']['httpStatusCode'], '');
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }

};

