import json
from datetime import datetime, timezone
import math

#  returns UTC epoch time
def lambda_handler(event, context):
    try:
        return {
            "isBase64Encoded": False,
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store' 
            }, 
            'body': json.dumps(math.floor(datetime.now(timezone.utc).timestamp() * 1000))
        }       
    except Exception as e:
        return {
            "isBase64Encoded": False,
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store' 
            }, 
            'body': json.dumps(str(e))
        }