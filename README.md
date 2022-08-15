##### DESCRIPTION:  
  RandomChat lets you chat with random users.  
  React code hosted using AWS Amplify and uses Amazon Cognito for user management and authorization of the APIs through API Gateway. Backend includes nodeJS Lambda functions that interact with DynamoDB. Uses CloudFormation and CodeDeploy for infrastructure provisioning and code deployments.

##### INSTALLATION:
  * Frontend code present in the 'frontend' folder  
    - REACT  
        npx create-react-app frontend  
    - Bootstrap  
        npm install bootstrap  
    - React Bootstrap  
      Install React Bootstrap and add bootstrap.css path to the index.js  
        npm install react-bootstrap bootstrap  
    - AWS SDK for JavaScript  
      npm install aws-sdk  
    - Font Awesome for REACT  
        npm install @fortawesome/fontawesome-svg-core  
        npm install @fortawesome/free-solid-svg-icons  
        npm install @fortawesome/react-fontawesome  
        npm install @fortawesome/fontawesome

  * Backend code present in the 'backend' folder
      - Create a S3 bucket(mention bucket name and region) for CloudFormation files  
           aws s3 mb s3://randomchatcloudformationbucket --region us-east-2
      - AWS SDK for JavaScript DynamoDB Client for nodeJS  
        Create as a package and later turn it into a nodeJS lambda layer  
        Create a folder and within that, create another folder 'nodejs' and initialize it  
           npm init -y  
        Install the package and mention the path in the CloudFormation template  
           npm install @aws-sdk/client-dynamodb
      - AWS SDK for JavaScript CognitoIdentityProvider Client for nodeJS  
        Repeat the above process  
           npm init -y  
           npm install @aws-sdk/client-cognito-identity-provider
      - CloudFormation SETUP:  
        1. Create a CloudFormation stack for DynamoDB tables  
           aws cloudformation create-stack --stack-name RandomChat-DynamoDB-Tables --template-body file://template-DynamoDBTables.yml  
        2. Create a stack for the Lambda layers  
           sam deploy --template-file C:\Users\ayyap\Documents\programming\RandomChat\backend\CloudFormation\template-LambdaLayer.yml --stack-name RandomChat-LambdaLayer --capabilities CAPABILITY_IAM --s3-bucket randomchatcloudformationbucket  
        3. Create a stack for Lambda-PreSignup. Used to auto-confirm Cognito users right after their accounts are created  
           sam deploy --template-file C:\Users\ayyap\Documents\programming\RandomChat\backend\CloudFormation\template-CognitoUserPool-Lambda-PreSignup.yml --stack-name RandomChat-CognitoUserPool-Lambda-PreSignup --capabilities CAPABILITY_IAM --s3-bucket randomchatcloudformationbucket  
        4. Create a stack for CognitoUserPool and it's AppClient  
           sam deploy --template-file C:\Users\ayyap\Documents\programming\RandomChat\backend\CloudFormation\template-CognitoUserPool-Table-AppClient.yml --stack-name RandomChat-CognitoUserPool-Table-AppClient --capabilities CAPABILITY_IAM --s3-bucket randomchatcloudformationbucket  
        5. Create a stack for a permission that will be used by the CognitoUserPool to invoke the Lambda-PreSignup function  
           sam deploy --template-file C:\Users\ayyap\Documents\programming\RandomChat\backend\CloudFormation\template-LambdaPermissionForCognitoUserPool.yml --stack-name RandomChat-LambdaPermissionForCognitoUserPool --capabilities CAPABILITY_IAM --s3-bucket randomchatcloudformationbucket  
        6. Create a stack for Lambda fns(including automated tests), API Gateway APIs and CognitoAuthorizer  
           sam deploy --template-file C:\Users\ayyap\Documents\programming\RandomChat\backend\CloudFormation\template-APIsAndLambdaFunctions.yml --stack-name RandomChat-APIs-LambdaFunctions --capabilities CAPABILITY_IAM --s3-bucket randomchatcloudformationbucket

##### URL:  
  * https://main.do6w9rmh0t2vd.amplifyapp.com/
