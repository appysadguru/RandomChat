const { DynamoDBClient, QueryCommand, DeleteItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });

const AWS = require('aws-sdk');
const codedeploy = new AWS.CodeDeploy();
var lambda = new AWS.Lambda();


async function test1(functionToTest){

    try {
        console.log('inside fn PostMessageTest - test1');

        let test1Result = true;

        // invoke lambda fn
        const userID = 'RandomChatPostMessageTest1';
        const timestamp = Date.now().toString();
        const msg = 'RandomChatPostMessageTest1';
        const sender = 'RandomChatPostMessageTest1';

        const paramsInvoke = {
            'UserIDs': userID,
            'TimestampMilliseconds': timestamp,
            'Message': msg,
            'Sender': sender
        };

        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"body":JSON.stringify(paramsInvoke)})
        }).promise();

        console.log('response from the invoked RandomChatPostMessage fn');
        console.log(responseInvoke);

        // verify the result
        const paramsQuery = {
            'TableName': "RandomChat-Messages",
            'KeyConditionExpression': "UserIDs = :u",
            'ExpressionAttributeValues': { ":u": { 'S': userID }},
            'ProjectionExpression': "TimestampMilliseconds, Message, Sender",
            'ScanIndexForward': false,
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

        } else if (item['Message']['S'] !== msg) {
            console.log('setting test1Result to false');
            console.log("item['Message']['S']");
            console.log(item['Message']['S']);
            test1Result = false;
        }

        // delete the data
        const paramsDelete = {
            'TableName':'RandomChat-Messages',
            'Key':{
                'UserIDs':{ 'S': userID },
                'TimestampMilliseconds':{ 'N': timestamp }
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
    
    try {
        console.log('inside fn PostMessageTest - test2');
        
        let test2Result = true;

        // create test data
        const partitionKey = 'RandomChatPostMessageTest2';

        const sortKey2a = Date.now().toString();
        const msg2a = 'RandomChatPostMessageTest2a';
        const sender2a = 'RandomChatPostMessageTest2a';
        const timeToLive2a = (Math.floor(Date.now() / 1000) + 600).toString(); // 
        
        const paramsPut1a = {
            'TableName': "RandomChat-Messages",
            'Item': {
              'UserIDs': { 'S': partitionKey },
              'TimestampMilliseconds': { 'N': sortKey2a },
              'Message': { 'S': msg2a },
              'Sender': {'S': sender2a},
              'ExpirationTime': { 'N': timeToLive2a}
            },
            'ConditionExpression': 'attribute_not_exists(UserIDs)'
        };
        
        const responsePut1a = await ddbClient.send(new PutItemCommand(paramsPut1a));
        console.log('response from the first PutItemCommand');
        console.log(responsePut1a);

        // invoke lambda fn
        const paramsInvoke = {
            'UserIDs': partitionKey,
            'TimestampMilliseconds': sortKey2a,
            'Message': msg2a,
            'Sender': sender2a
        };
        
        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"body":JSON.stringify(paramsInvoke)})
        }).promise();
        
        console.log('response from the invoked RandomChatPostMessage fn');
        console.log(responseInvoke);

        const payload = JSON.parse(responseInvoke['Payload']);
        const errorMessage = JSON.parse(payload['body']);

        // verify the result
        if (payload['statusCode'] !== 400) {
            console.log('setting test2Result to false');
            console.log("payload['statusCode']");
            console.log(payload['statusCode']);
            test2Result = false;
        
        } else if (errorMessage !== 'ConditionalCheckFailedException') {
            console.log('setting test2Result to false');
            console.log("errorMessage");
            console.log(errorMessage);
            test2Result = false;

        }

        // delete the data
        const paramsDelete = {
            'TableName':'RandomChat-Messages',
            'Key':{
                'UserIDs':{ 'S': partitionKey },
                'TimestampMilliseconds':{ 'N': sortKey2a }
            }
        };

        const responseDelete = await ddbClient.send(new DeleteItemCommand(paramsDelete));
        console.log('response from the DeleteItemCommand');
        console.log(responseDelete);

        return test2Result;

    } catch (error) {
        console.log('error in test2');
        console.log(error);
        
        return false;
    }
}

async function test3(functionToTest){
    
    try {
        console.log('inside fn PostMessageTest - test3');
        
        let test3Result = true;

        // invoke lambda fn

        const partitionKey = 'RandomChatPostMessageTest3';
        const sortKey = Date.now(); // providing a numerical value instead of a string
        const msg = 'RandomChatPostMessageTest3';
        const sender = 'RandomChatPostMessageTest3';
        
        const paramsInvoke = {
            'UserIDs': partitionKey,
            'TimestampMilliseconds': sortKey,
            'Message': msg,
            'Sender': sender
        };
        
        const responseInvoke = await lambda.invoke({
            FunctionName: functionToTest,
            Payload: JSON.stringify({"body":JSON.stringify(paramsInvoke)})
        }).promise();
        
        console.log('response from the invoked RandomChatPostMessage fn');
        console.log(responseInvoke);

        const payload = JSON.parse(responseInvoke['Payload']);
        const errorMessage = JSON.parse(payload['body']);

        // verify the result
        if (payload['statusCode'] !== 400) {
            console.log('setting test3Result to false');
            console.log("payload['statusCode']");
            console.log(payload['statusCode']);
            test3Result = false;
        
        } else if (errorMessage !== 'SerializationException') {
            console.log('setting test3Result to false');
            console.log("errorMessage");
            console.log(errorMessage);
            test3Result = false;

        }

        return test3Result;

    } catch (error) {
        console.log('error in test3');
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
    
    const result3 = await test3(functionToTest);
    arrayResult.push(result3);

    const finalResult = arrayResult.every(element => element === true);

    // Pass the validation test result to AWS CodeDeploy
    return await codedeploy.putLifecycleEventHookExecutionStatus({
        deploymentId: DeploymentId,
        lifecycleEventHookExecutionId: LifecycleEventHookExecutionId,
        status:  finalResult === true ? 'Succeeded' : 'Failed'
    }).promise();

};