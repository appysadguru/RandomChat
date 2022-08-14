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

// creates a msg in the DynamoDB 'RandomChat-Messages' table
exports.handler = async (event) => {
    try {

        const payload = JSON.parse(event['body']);  // data sent by the front-end
        
        const partitionKey = payload['UserIDs'];  
        const sortKey = payload['TimestampMilliseconds'];
        const msg = payload['Message'];
        const sender = payload['Sender'];
        const timeToLive = (Math.floor(Date.now() / 1000) + 600).toString();
        
        const params = {
            'TableName': "RandomChat-Messages",
            'Item': {
              'UserIDs': { 'S': partitionKey },
              'TimestampMilliseconds': { 'N': sortKey },
              'Message': { 'S': msg },
              'Sender': {'S': sender},
              'ExpirationTime': { 'N': timeToLive}
            },
            'ConditionExpression': 'attribute_not_exists(UserIDs)'  // if there exists an item/msg with this primary key then do not overwrite that item and cancel this operation(extremely rare scenario)
        };
        
        const data = await ddbClient.send(new PutItemCommand(params));      // creates an item/msg in the table
        return responseData(data['$metadata']['httpStatusCode'], '');
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }
}

