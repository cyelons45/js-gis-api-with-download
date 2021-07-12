1.Verify that the API accept request through POST method.
2.GPOM gtChangeDetection API should accept request in below format.
{ 
  "fromSyncDate":"20200916",
  "assetName":["Valve"],
  "dataLimit":100,
  "dataOffset":0
 }
3.The ONLY required field is fromSyncDate. The rest are optional.
[Default for dataLimit=1000 dataOffset=0];
4.API should pass all validation tests and return response as below. 
{
    "code": "s001",
    "status": "Completed",
    "message": "Request completed successfully.",
    "count": 4,
    "changeDetectionList": [
        {
            "assetName": "Valve",
            "flag": "insert",
            "equipmentId": "IE000000000044615604",
            "functionalLocation": "",
            "latitude": "40.8701866891",
            "longitude": "-121.698471126",
            "updateDate": "01/20/2020 12:00:00 AM",
            "syncDate": "20200916"
        },
        {
            "assetName": "Valve",
            "flag": "insert",
            "equipmentId": "",
            "functionalLocation": "GT.TM.LSCV.DREG5030",
            "latitude": "40.8701866891",
            "longitude": "-121.698471126",
            "updateDate": "06/21/2020 12:00:00 AM",
            "syncDate": "20200918"
        },
        {
            "assetName": "Valve",
            "flag": "update",
            "equipmentId": "",
            "functionalLocation": "GT.TM.LSCV.DREG5030",
            "latitude": "40.8701866891",
            "longitude": "-121.698471126",
            "updateDate": "08/18/2020 12:00:00 AM",
            "syncDate": "20200916"
        },
        {
            "assetName": "Valve",
            "flag": "update",
            "equipmentId": "",
            "functionalLocation": "GT.TM.LSCV.DREG5030",
            "latitude": "40.8701866891",
            "longitude": "-121.698471126",
            "updateDate": "09/22/2020 12:00:00 AM",
            "syncDate": "20200919"
        }
    ]
}
5.Verify that response is sorted by syncDate and flag.
6.Pass request as  "fromSyncDate":"12262020".
7.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Accepted fromSyncDate format is YYYYMMDD"
}
8.Pass request as  "assetName":["Valves"].
8.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Invalid assetName provided, accepted asset name should be Valve."
}
9.Pass request as:
{
	"assetName":["Valve"],
	"offset":0,
	"limit":10
}

9.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Request body is missing fromSyncDate property. "
}
10.Pass request as "assetName":"Valve"
11.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Incorrect input value type. Asset name must be an Array! "
}
12.Pass request as:
{
 "fromSyncDate":"20201008",
  "assetName":["Valve"],
"offset":0,
"limit":-10
}
13.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Invalid limit value provided. "
}

14.Pass assetName as "assetName":["valve"]
15.AssetName is case sensitive.
16.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Invalid assetName provided, accepted asset name should be Valve."
}