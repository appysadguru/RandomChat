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

        console.log('inside fn - RandomChat-PostMessages');

        const payload = JSON.parse(event['body']);
        
        const partitionKey = payload['UserIDs'];  // 
        const sortKey = payload['TimestampMilliseconds']; // 
        const msg = payload['Message']; //
        const sender = payload['Sender'];
        const timeToLive = (Math.floor(Date.now() / 1000) + 600).toString(); // 
        
        const params = {
            'TableName': "RandomChat-Messages",
            'Item': {
              'UserIDs': { 'S': partitionKey },
              'TimestampMilliseconds': { 'N': sortKey },
              'Message': { 'S': msg },
              'Sender': {'S': sender},
              'ExpirationTime': { 'N': timeToLive}
            },
            'ConditionExpression': 'attribute_not_exists(UserIDs)'
        };
        
        const data = await ddbClient.send(new PutItemCommand(params));
        console.log('data');
        console.log(data);
        return responseData(data['$metadata']['httpStatusCode'], '');
        
    } catch (err) {
        console.log('error');
        console.log(err);
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }
}

