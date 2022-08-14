const { CognitoIdentityProviderClient, ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider");
const cipclient = new CognitoIdentityProviderClient({ region: "us-east-2" });


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

// gets a list of users from Cognito Userpool -> RandomChat-User
exports.handler = async (event) => {
    
    try {
        
        const userPoolId = event['queryStringParameters']['userPoolId'];
        let paginationToken = event['queryStringParameters']['paginationToken'];
        
        if (paginationToken === '') {
            paginationToken = null;
        }
        
        const params = {
            "Limit": 60,
            "UserPoolId": userPoolId,
            "PaginationToken": paginationToken
        };
            
        const data = await cipclient.send(new ListUsersCommand(params));
        
        return responseData(data['$metadata']['httpStatusCode'], data);
        
    } catch (err) {
        return responseData(err['$metadata']['httpStatusCode'], err['name']);
    }
};
