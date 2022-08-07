const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });

const AWS = require('aws-sdk');
const codedeploy = new AWS.CodeDeploy();
var lambda = new AWS.Lambda();

// yet to add comments


async function test1(functionToTest){

    try {
        console.log('inside fn GetMessagesTest - test1');

        let test1Result = true;

        // create test data(first and second item - same partition key but two different sort keys)
        const partitionKey = 'RandomChatGetMessagesTest1';

        const sortKey1a = Date.now().toString();
        const msg1a = 'RandomChatGetMessagesTest1a';
        const sender1a = 'RandomChatGetMessagesTest1a';
        const timeToLive1a = (Math.floor(Date.now() / 1000) + 600).toString(); // 
        
        const paramsPut1a = {
            'TableName': "RandomChat-Messages",
            'Item': {
              'UserIDs': { 'S': partitionKey },
              'TimestampMilliseconds': { 'N': sortKey1a },
              'Message': { 'S': msg1a },
              'Sender': {'S': sender1a},
              'ExpirationTime': { 'N': timeToLive1a}
            },
            'ConditionExpression': 'attribute_not_exists(UserIDs)'
        };
        
        const responsePut1a = await ddbClient.send(new PutItemCommand(paramsPut1a));
        console.log('response from the first PutItemCommand');
        console.log(responsePut1a);

        const sortKey1b = Date.now().toString();
        const msg1b = 'RandomChatGetMessagesTest1b';
        const sender1b = 'RandomChatGetMessagesTest1b';
        const timeToLive1b = (Math.floor(Date.now() / 1000) + 600).toString(); // 
        
        const paramsPut1b = {
            'TableName': "RandomChat-Messages",
            'Item': {
              'UserIDs': { 'S': partitionKey },
              'TimestampMilliseconds': { 'N': sortKey1b },
              'Message': { 'S': msg1b },
              'Sender': {'S': sender1b},
              'ExpirationTime': { 'N': timeToLive1b}
            },
            'ConditionExpression': 'attribute_not_exists(UserIDs)'
        };
        
        const responsePut1b = await ddbClient.send(new PutItemCommand(paramsPut1b));
        console.log('response from the second PutItemCommand');
        console.log(responsePut1b);

        // invoke lambda fn
        const paramsInvoke = {
            'UserIDs': partitionKey
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"queryStringParameters":paramsInvoke})
        }).promise();

        console.log('response from the invoked RandomChatGetMessages fn');
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
            
        } else if (Object.keys(listOfItems[0]).length !== 3) {
            console.log('setting test1Result to false');
            console.log('Object.keys(listOfItems[0]).length');
            console.log(Object.keys(listOfItems[0]).length);
            test1Result = false;

        } else if (listOfItems[0]['Message']['S'] !== msg1b) {
            console.log('setting test1Result to false');
            console.log('listOfItems[0]["Message"]["S"]');
            console.log(listOfItems[0]['Message']['S']);
            test1Result = false;

        } else if (listOfItems[1]['Message']['S'] !== msg1a) {
            console.log('setting test1Result to false');
            console.log('listOfItems[0]["Message"]["S"]');
            console.log(listOfItems[0]['Message']['S']);
            test1Result = false;

        }

        // delete the data(first and second item)
        const paramsDelete1a = {
            'TableName':'RandomChat-Messages',
            'Key':{
                'UserIDs':{ 'S': partitionKey },
                'TimestampMilliseconds':{ 'N': sortKey1a }
            }
        };

        const responseDelete1a = await ddbClient.send(new DeleteItemCommand(paramsDelete1a));
        console.log('response from the first DeleteItemCommand');
        console.log(responseDelete1a);

        const paramsDelete1b = {
            'TableName':'RandomChat-Messages',
            'Key':{
                'UserIDs':{ 'S': partitionKey },
                'TimestampMilliseconds':{ 'N': sortKey1b }
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
        console.log('inside fn GetMessagesTest - test2');

        let test2Result = true;

        // invoke lambda fn
        const partitionKey = 'RandomChatGetMessagesTest2' + Date.now().toString();
        
        const paramsInvoke = {
            'UserIDs': partitionKey
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"queryStringParameters":paramsInvoke})
        }).promise();

        console.log('response from the invoked RandomChatGetMessages fn');
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

        // delete the data

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