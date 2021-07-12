1.Verify that the API accept request through POST method.
2.GPOM gdChangeDetection API should accept request in below format.
{ 
"fromSyncDate": "20201420",
 "assetName":["CustomerRegulator", 
 "RegulatorStation","GasValve"], 
 "limit": 1000,
 "offset" : 0
 }
3.The ONLY required field is fromSyncDate. The rest are optional.
[Default for limit=1000 offset=0];
4.API should pass all validation tests and return response as below. 
{
    "code": "s001",
    "status": "Completed",
    "message": "Request completed successfully.",
    "count": 7,
    "changeDetectionList": [
        {
            "assetName": "CustomerRegulator",
            "flag": "Update",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.FTAP.03412",
            "latitude": "39.55834655",
            "longitude": "-122.0792027",
            "updateDate": "09/29/2020 06:10:01 AM",
            "syncDate": "20201010"
        },
        {
            "assetName": "CustomerRegulator",
            "flag": "Insert",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.FTAP.03413",
            "latitude": "39.54490576",
            "longitude": "-121.6884604",
            "updateDate": "10/07/2020 01:54:01 PM",
            "syncDate": "20201008"
        },
        {
            "assetName": "CustomerRegulator",
            "flag": "Insert",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.DIST.00920",
            "latitude": "40.08120236",
            "longitude": "-122.1743638",
            "updateDate": "10/08/2020 05:10:01 PM",
            "syncDate": "20201008"
        },
        {
            "assetName": "GasValve",
            "flag": "Update",
            "equipmentId": "41309432",
            "functionalLocation": "",
            "latitude": "39.5333741",
            "longitude": "-122.193601",
            "updateDate": "10/08/2020 07:54:01 PM",
            "syncDate": "20201008"
        },
        {
            "assetName": "RegulatorStation",
            "flag": "Insert",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.HPRS.00545",
            "latitude": "39.76857478",
            "longitude": "-122.1103732",
            "updateDate": "10/08/2020 09:20:01 PM",
            "syncDate": "20201008"
        },
        {
            "assetName": "RegulatorStation",
            "flag": "Update",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.DIST.00932",
            "latitude": "40.57248628",
            "longitude": "-122.3528515",
            "updateDate": "10/08/2020 09:53:01 PM",
            "syncDate": "20201008"
        },
        {
            "assetName": "RegulatorStation",
            "flag": "Update",
            "equipmentId": "",
            "functionalLocation": "GD.STAT.DIST.00942",
            "latitude": "40.87386343",
            "longitude": "-121.6533477",
            "updateDate": "10/08/2020 09:54:01 PM",
            "syncDate": "20201008"
        }
    ]
}
5.Verify that response is sorted by syncDate and then flag.
6.Pass request as  "fromSyncDate":"12262020".
7.API should fail the request and send response as
{
	"code": "e003",     
	"status": "Failed",     
	"message": "Validation error. Invalid fromSyncDate provided. "
}
8.Pass request as:
{
	"assetName":["RegulatorStation","CustomerRegulator","GasValve"],
	"offset":0,
	"limit":10
}

9.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Request body is missing fromSyncDate property. "
}
10.Pass request as "assetName":"GasValve"
11.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Incorrect input value type. Asset name must be an Array! "
}
12.Pass request as:
{
 "fromSyncDate":"20201008",
  "assetName":["RegulatorStation","CustomerRegulator","GasValve"],
"offset":0,
"limit":-10
}
13.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Invalid limit value provided. "
}

14.Pass assetName as "assetName":["regulatorstation","CustomerRegulator","GasValve"]
15.AssetNameis case sensitive.
16.API should fail the request and send response as
{
    "code": "e003",
    "status": "Failed",
    "message": "Validation error. Invalid Assetname \" regulatorstation \". Assetname should be RegulatorStation or GasValve or CustomerRegulator. "
}