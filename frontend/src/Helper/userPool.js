import { CognitoUserPool } from 'amazon-cognito-identity-js';

export const poolData = {
	UserPoolId: 'us-east-2_qcQju0Jey',
	ClientId: '2i812p5ifdo20uhijmkpje306h'
}

export default new CognitoUserPool(poolData);