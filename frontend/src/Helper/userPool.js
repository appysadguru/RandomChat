import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
	UserPoolId: 'us-east-2_GWhfP3dAo',
	ClientId: '6kjrs9c526odbb1kmv8v51b3pr'
}

export default new CognitoUserPool(poolData);