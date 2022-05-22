
import aws from 'aws-sdk';
import {region, accessKeyId, secretAccessKey} from './keys';


export const cognitoISP = new aws.CognitoIdentityServiceProvider({
    "region": region,
    "accessKeyId": accessKeyId,
    "secretAccessKey": secretAccessKey
});

