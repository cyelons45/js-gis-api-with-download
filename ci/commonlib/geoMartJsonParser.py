import json

class JsonParserTool():
    """
        Helper for JSON
    """
    def validateJson(self, data):
        """
            validate JSON
            data: Input JSON data
        """
        try:
            json.loads(data)
            return True
        except Exception as e:
            print("Error in Validate Json --> " + str(e)).with_traceback(e.__traceback__)
            return False
        
    def jsonParser(self, data):
        """
            Parse JSON
            data: Input JSON data
        """
        try:
            return json.loads(data)
        except Exception as e:
            print("Error in Parsing Json -->" + str(e)).with_traceback(e.__traceback__)
            return None        