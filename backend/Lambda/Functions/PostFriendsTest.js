const { DynamoDBClient, QueryCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });

const AWS = require('aws-sdk');
const codedeploy = new AWS.CodeDeploy();
var lambda = new AWS.Lambda();

// yet to add comments


async function test1(functionToTest){

    try {
        console.log('inside fn PostFriendsTest - test1');

        let test1Result = true;

        // invoke lambda fn
        const partitionKey = 'RandomChatPostFriendsTest1';
        const sortKey = 'FriendUsername1';

        const paramsInvoke = {
            'Username': partitionKey,
            'FriendUsername': sortKey,
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"body":JSON.stringify(paramsInvoke)})
        }).promise();

        console.log('response from the invoked RandomChatPostFriends fn');
        console.log(responseInvoke);

        // verify the result
        const paramsQuery = {
            'TableName': "RandomChat-Friends",
            'KeyConditionExpression': "Username = :u",
            'ExpressionAttributeValues': { ":u": { 'S': partitionKey } },
            'ProjectionExpression': "FriendUsername",
        };

        const responseQuery = await ddbClient.send(new QueryCommand(paramsQuery));
        console.log('response from the QueryCommand');
        console.log(responseQuery);
        console.log(responseQuery['Items']);

        const item = responseQuery['Items'][0];

        if (responseQuery['ScannedCount'] !== 1) {
            console.log('setting test1Result to false');
            console.log("responseQuery['ScannedCount']");
            console.log(responseQuery['ScannedCount']);
            test1Result = false;

        } else if (item['FriendUsername']['S'] !== sortKey) {
            console.log('setting test1Result to false');
            console.log("item['FriendUsername']['S']");
            console.log(item['FriendUsername']['S']);
            test1Result = false;
        }

        // delete the data
        const paramsDelete = {
            'TableName':'RandomChat-Friends',
            'Key':{
                'Username':{ 'S': partitionKey },
                'FriendUsername':{ 'S': sortKey }
            }
        };

        const responseDelete = await ddbClient.send(new DeleteItemCommand(paramsDelete));
        console.log('response from the DeleteItemCommand');
        console.log(responseDelete);

        return test1Result;

    } catch (error) {
        console.log('error in test1');
        console.log(error);
        
        return false;
    }
}

async function test2(functionToTest){
    console.log('inside fn PostFriendsTest - test2');
    try {

        let test2Result = true;

        // invoke lambda fn
        const partitionKey = 'RandomChatPostFriendsTest2';
        const sortKey = 5; // providing a numerical value instead of a string

        const paramsInvoke = {
            'Username': partitionKey,
            'FriendUsername': sortKey,
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"body":JSON.stringify(paramsInvoke)})
        }).promise();

        console.log('response from the invoked RandomChatPostFriends fn');
        console.log(responseInvoke);

        const payload = JSON.parse(responseInvoke['Payload']);
        const errorMessage = JSON.parse(payload['body']);

        // verify the result
        if (payload['statusCode'] !== 400) {
            console.log('setting test2Result to false');
            console.log("payload['statusCode']");
            console.log(payload['statusCode']);
            test2Result = false;
        
        } else if (errorMessage !== 'SerializationException') {
            console.log('setting test2Result to false');
            console.log("errorMessage");
            console.log(errorMessage);
            test2Result = false;

        }

        return test2Result;

    } catch (error) {
        console.log('error in test2');
        console.log(error);

        return false;
    }
}



exports.handler = async (event, context) => {
    
    const {DeploymentId, LifecycleEventHookExecutionId} = event;
    const functionToTest = process.env.NewVersion;  // defined in CloudFormation template

    const arrayResult = [];

    // Validation tests

    const result1 = await test1(functionToTest);
    arrayResult.push(result1);
    
    const result2 = await test2(functionToTest);
    arrayResult.push(result2);
    
    
    const finalResult = arrayResult.every(element => element === true);

    // Pass the validation test result to AWS CodeDeploy
    return await codedeploy.putLifecycleEventHookExecutionStatus({
        deploymentId: DeploymentId,
        lifecycleEventHookExecutionId: LifecycleEventHookExecutionId,
        status:  finalResult === true ? 'Succeeded' : 'Failed'
    }).promise();

};