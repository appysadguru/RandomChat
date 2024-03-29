const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
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

// gets msgs from the DynamoDB 'RandomChat-Messages' table
exports.handler = async (event) => {
    
    try {
        let data, params, paginateToken = null, finalData = [];

        const partitionKey = event["queryStringParameters"]['UserIDs'];  // query string parameters sent by the front-end
        const timestampMinusFiveMins = (Date.now() - 300000).toString();    // to retrieve only those msgs for which the TimestampMilliseconds(sort key) value is within the last 5 minutes
        
        // pagination
        do {
            params = {
                'TableName': "RandomChat-Messages",
                'KeyConditionExpression': "UserIDs = :u AND TimestampMilliseconds > :t",
                'ExpressionAttributeValues': { ":u": { 'S': partitionKey }, ":t": {'N': timestampMinusFiveMins} },
                'ProjectionExpression': "TimestampMilliseconds, Message, Sender",
                'ScanIndexForward': false,
                'ExclusiveStartKey': paginateToken
            };
            
            data = await ddbClient.send(new QueryCommand(params));      // gets items from the table
            
            paginateToken = data['LastEvaluatedKey'];

            finalData.push(...data['Items']);

        } while (paginateToken != undefined);

        return responseData(data['$metadata']['httpStatusCode'], finalData);
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }
};

