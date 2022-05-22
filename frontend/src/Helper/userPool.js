import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
	UserPoolId: 'us-east-2_iJY8zyOxq',
	ClientId: '1jd2rspl46367mvuqnf88q403h'
}

export default new CognitoUserPool(poolData);