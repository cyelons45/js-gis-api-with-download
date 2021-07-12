# ===========================================================================
#geomartConfigTool.py
# ---------------------------------------------------------------------------
#
# This script contains useful config read functions.
# Usage: import geomartConfigTool
#        Then call a function in this script
#
# ===========================================================================

print ("Loading geomartConfigTool libraries")

import json
import os,sys

class ConfigTool:
    """
        Helper function for config
    """
    def __init__(self, environment,configPathWithName):
        try:
            self.environment = environment
            self.configPath = configPathWithName
        except Exception as e:
            raise Exception("ConfigTool initialization failed.." + str(e)).with_traceback(e.__traceback__)

    def getConfig(self):
        """
            Read config file
        """
        try:
            with open(self.configPath, encoding='utf-8-sig') as outfile:
                jObj = json.loads(outfile.read())

            if(jObj != None):
                keys = jObj.get(self.environment,None)
                return keys

        except Exception as e:
            raise Exception("get Config failed.." + str(e)).with_traceback(e.__traceback__)