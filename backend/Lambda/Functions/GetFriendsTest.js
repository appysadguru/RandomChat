const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });

const AWS = require('aws-sdk');
const codedeploy = new AWS.CodeDeploy();
var lambda = new AWS.Lambda();


async function test1(functionToTest){

    try {
        console.log('inside fn GetFriendsTest - test1');

        let test1Result = true;

        // create test data (first and second item - same partition key but two different sort keys)
        const partitionKey = 'RandomChatGetFriendsTest1';

        const sortKey1a = 'FriendUsername1a';       

        const params1a = {
            'TableName': 'RandomChat-Friends',
            'Item': {
              'Username': { 'S': partitionKey },
              'FriendUsername': { 'S': sortKey1a }
           },
        };

        const responsePut1a = await ddbClient.send(new PutItemCommand(params1a));
        console.log('response from the first PutItemCommand');
        console.log(responsePut1a);

        const sortKey1b = 'FriendUsername1b';    

        const params1b = {
            'TableName': 'RandomChat-Friends',
            'Item': {
              'Username': { 'S': partitionKey },
              'FriendUsername': { 'S': sortKey1b }
           },
        };

        const responsePut1b = await ddbClient.send(new PutItemCommand(params1b));
        console.log('response from the second PutItemCommand');
        console.log(responsePut1b);

        // invoke lambda fn
        const paramsInvoke = {
            'Username': partitionKey
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"queryStringParameters":paramsInvoke})
        }).promise();

        console.log('response from the invoked RandomChatGetFriends fn');
        console.log(responseInvoke);
        
        const payload = JSON.parse(responseInvoke['Payload']);
        const listOfItems = JSON.parse(payload['body']);

        // verify the result
        if (payload['statusCode'] !== 200) {
            console.log('setting test1Result to false');
            console.log("payload['statusCode']");
            console.log(payload['statusCode']);
            test1Result = false;
        
        } else if (listOfItems.length !== 2) {
            console.log('setting test1Result to false');
            console.log('listOfItems.length');
            console.log(listOfItems.length);
            test1Result = false;
        
        } else if (Object.keys(listOfItems[0]).length !== 1) {
            console.log('setting test1Result to false');
            console.log('Object.keys(listOfItems[0]).length');
            console.log(Object.keys(listOfItems[0]).length);
            test1Result = false;

        } else if (listOfItems[0]['FriendUsername']['S'] !== sortKey1a) {
            console.log('setting test1Result to false');
            console.log('listOfItems[0]["FriendUsername"]["S"]');
            console.log(listOfItems[0]["FriendUsername"]["S"]);
            test1Result = false;
        
        } else if (listOfItems[1]['FriendUsername']['S'] !== sortKey1b) {
            console.log('setting test1Result to false');
            console.log('listOfItems[0]["FriendUsername"]["S"]');
            console.log(listOfItems[0]["FriendUsername"]["S"]);
            test1Result = false;
        
        }     

        // delete the data(first and second item)

        const paramsDelete1a = {
            'TableName':'RandomChat-Friends',
            'Key':{
                'Username': { 'S': partitionKey },
                'FriendUsername': { 'S': sortKey1a }
            }
        };

        const responseDelete1a = await ddbClient.send(new DeleteItemCommand(paramsDelete1a));
        console.log('response from the first DeleteItemCommand');
        console.log(responseDelete1a);

        const paramsDelete1b = {
            'TableName':'RandomChat-Friends',
            'Key':{
                'Username': { 'S': partitionKey },
                'FriendUsername': { 'S': sortKey1b }
            }
        };

        const responseDelete1b = await ddbClient.send(new DeleteItemCommand(paramsDelete1b));
        console.log('response from the second DeleteItemCommand');
        console.log(responseDelete1b);

        return test1Result;

    } catch (error) {
        console.log('error in test1');
        console.log(error);

        return false;
    }
}

async function test2(functionToTest){

    try {
        console.log('inside fn GetFriendsTest - test2');

        let test2Result = true;

        // invoke lambda fn
        const partitionKey = 'RandomChatGetFriendsTest2' + Date.now().toString();
        
        const paramsInvoke = {
            'Username': partitionKey
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"queryStringParameters":paramsInvoke})
        }).promise();

        console.log('response from the invoked RandomChatGetFriends fn');
        console.log(responseInvoke);

        const payload = JSON.parse(responseInvoke['Payload']);
        const listOfItems = JSON.parse(payload['body']);

        // verify the result
        if (payload['statusCode'] !== 200) {
            console.log('setting test2Result to false');
            console.log("payload['statusCode']");
            console.log(payload['statusCode']);
            test2Result = false;

        } else if (listOfItems.length !== 0) {
            console.log('setting test2Result to false');
            console.log('listOfItems.length');
            console.log(listOfItems.length);
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