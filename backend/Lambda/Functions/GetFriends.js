const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
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
        let data, params, paginateToken = null, finalData = [];

        const partitionKey = event["queryStringParameters"]['Username'];

        do {
            params = {
                'TableName': "RandomChat-Friends",
                'KeyConditionExpression': "Username = :u",
                'ExpressionAttributeValues': { ":u": { 'S': partitionKey } },
                'ProjectionExpression': "FriendUsername",
                "ExclusiveStartKey": paginateToken
            };
            
            data = await ddbClient.send(new QueryCommand(params));
            
            paginateToken = data['LastEvaluatedKey'];

            finalData.push(...data['Items']);

        } while (paginateToken != undefined);
        
        return responseData(data['$metadata']['httpStatusCode'], finalData);
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }
};

