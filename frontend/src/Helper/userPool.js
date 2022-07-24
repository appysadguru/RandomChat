import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
	// UserPoolId: 'us-east-2_iJY8zyOxq',
	// ClientId: '1jd2rspl46367mvuqnf88q403h'
	UserPoolId: 'us-east-2_sLiBqYe6r',
	ClientId: '67lgufpkapn1cue2j038mueh6q'
}

export default new CognitoUserPool(poolData);