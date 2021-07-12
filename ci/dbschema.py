import sys
import os, glob
from commonlib.geomartPostgresTool import PostgresTool
from commonlib.geomartConfigTool import ConfigTool
from commonlib.geomartSeceretManager import AWSSeceretManger

#set working directory in beginning of the python
if not os.path.dirname(__file__) == "":    
    os.chdir(os.path.dirname(__file__))

def executePGScripts():    
    """
        execute sql script against database
    """
    try:
        returnCode = 0
        print("Executing Conductor shape tier calculation script")
        sqlfile = sorted(glob.glob(sqlpath))
        overwriteschemaorfunction = False

        if config["schemachange"] == "true":
            print("performing schema change")
            overwriteschemaorfunction = True
        else:
            print("No schema change selected")

        if config["functionandaccess"] == "true":
            print("create or alter functions")
            overwriteschemaorfunction = True
        else:
            print("No create or alter function selected")

        if overwriteschemaorfunction:
            for sql in sqlfile:
                runquery = False

                if config["schemachange"] == "true":
                    if not sql.find("schema.sql")  == -1:
                        runquery = True


                if config["functionandaccess"] == "true":
                    if sql.find("schema.sql")  == -1:
                        runquery = True
                
                if runquery:
                    cur = pPostgresTool.createFunctionOrSchemaFromFile(sql)
                    print("Success")
                    
                    pPostgresTool.commit()

        return returnCode
    except Exception as e:
        print('dbschema execution Failed! - %s' + e.args[0])
        return 1
    finally:
        if 'pPostgresTool' in globals():
            if not pPostgresTool is None:
                pPostgresTool.close()

def setGlobals(configSectionName):    
    """
        set global variables using configuration file
    """
    global config    
    configNameWithPath = "app.cfg"
    pConfigTool = ConfigTool(configSectionName,configNameWithPath)
    config = pConfigTool.getConfig()

    global sqlpath 
    sqlpath = config["sql"]

    print('Start fetch from Secret Manager')
    
    pAWSSeceretManger = AWSSeceretManger(config["AWSRegionName"], config["AWSSecretName"], config["AWSProfileName"],configSectionName)    
    secertKeyValue = pAWSSeceretManger.get_secret()
    
    print("connect to postgress DB")
    global pPostgresTool
    pPostgresTool = PostgresTool(secertKeyValue["primarydb"],secertKeyValue["dbname"],secertKeyValue["username"],secertKeyValue["password"])

def main(argv):
    """
        execute script
    """
    print("started")
    print(argv[1])
    try:
        setGlobals(argv[1])
        print('Started Execution')

        returnCode = executePGScripts()
        return returnCode
    except Exception as e:
        print('db! - ' + str(e))
        return 1

if __name__ == '__main__':
    intReturnCode = main(sys.argv) #sys.argv

    print('Exit code - ' + str(intReturnCode))

    os._exit(intReturnCode)