import boto3
import sys,os
from botocore.exceptions import ClientError
sys.path.append(os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..\\', '')))
from commonlib.geoMartJsonParser import JsonParserTool
import ast
import json

class AWSSeceretManger:
    def __init__(self,regionName,secretName,profileName,environment):

        """This function initialize AWS secret manager.
        Args:
            regionName: aws region name 
            secretName: aws secret name
            profileName: aws profile name
            environment: environment
        """
        try:
            self.regionName = regionName
            self.secretName = secretName
            self.profileName = profileName
            self.environment = environment
        except Exception as e:
            raise Exception("AWSSeceretmanger initialization failed.." + str(e)).with_traceback(e.__traceback__)
            
    def get_secret(self):
        secret_name = self.secretName #"rds/pspspostgresdev/superadmin"
        region_name = self.regionName #"us-west-2"
            
        ## to run local do this
        if(self.environment == "LOCAL"):
            boto3.setup_default_session(profile_name=self.profileName) # GISCOE-Dev
            session = boto3.session.Session( profile_name=self.profileName) 
        else:
            session = boto3.session.Session() # To run in lambda
            
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name,
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=secret_name
            )    
            if 'SecretString' in get_secret_value_response:
                    secret = get_secret_value_response['SecretString']            
                    if JsonParserTool().validateJson(secret):
                        SecretString = JsonParserTool().jsonParser(secret)
                        return SecretString
                    else:
                        return None
            else:
                return None        
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                print("The requested secret " + secret_name + " was not found")
            elif e.response['Error']['Code'] == 'InvalidRequestException':
                print("The request was invalid due to:", e)
            elif e.response['Error']['Code'] == 'InvalidParameterException':
                print("The request had invalid params:", e)
            else:
                # Secrets Manager decrypts the secret value using the associated KMS CMK
                # Depending on whether the secret was a string or binary, only one of these fields will be populated
                if get_secret_value_response is None:
                    return None
                if 'SecretString' in get_secret_value_response:
                    text_secret_data = get_secret_value_response['SecretString']
                    print(text_secret_data)
                else:
                    binary_secret_data = get_secret_value_response['SecretBinary']
                    print(binary_secret_data)
            return None        

    def GetSeceretKey(self):
    
        """This function will get the secert key value from AWS Seceret Manager.
        Args:
            appConfig(dictonary): input for get the secert key.
        Returns:
            The return value. secertKeyValue dictonary for success.
        """
        
        try:
            print("Getting seceret key.")            

            secertKeyValue = self.get_secret()              
            secertKeyValue = json.loads(secertKeyValue)         
            
            return secertKeyValue
        
        except Exception as e:
                raise Exception("Error in get the seceretKey.."+ str(e)).with_traceback(e.__traceback__)
