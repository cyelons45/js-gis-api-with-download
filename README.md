# gis-geomartcloud-psps-api-eppackage
This repo is for eppackage API

### To deploy this code:

1. get the latest code from the appropriate GitHub branch and place it on the machine/VM it will run.
2. run whatever pipeline processes needed for deployment such as executing from a terminal: `npm i`, `npm test`, `npm run build`
3. deploy the build files to the Production or other environment

---

### To run the code from the pre-build files:

1. after `npm i` is successful, execute... `NODE_ENV=xxxx node app.js` `//Where xxxx is the environment such as prod, dev, qa, test`

### To run this code on a local machine:

1. on the local machine, cd into the folder associated with the repo for this code
2. pull the latest code from the GitHub branch
3. there is a .env file that you need to ensure is on the root of this app as it is a file that should not be kept in version control (GitHub)
4. The .env file for running on a local machine is...

```
# .env
# how .env with require dotenv works is at https://www.npmjs.com/package/dotenv
# DO NOT committing any .env file to version control.
# Each environment should maintain have it's own .env file.

# Change the following value for each environment
NODE_ENV = LOCAL
```

This Repo has below Rest End Points

## CreateJob

### Description -

This operation submits a Create job to SQS queue through POST method.
FileID date format is MMDDYYYY_HHMM

### URLs

Dev: TBD
Tst : TBD

### Request

```
{
        "reportType": "externalportalpackage",
        "versionID": [37,38],
        "eventID": 75,
        "eventName": "external event 1",
        "fileID": "05212020_1824"
}
```

### Response

Success
```
{
    "status": "Success",
    "code": "s007",
    "message": "Request submitted successfully to SQS queue",
    "jobId": 430,
    "jobStatus": "In Queue"
}

{
    "status": "Success",
    "code": "s007",
    "message": "Request with same version(s) exists.",
    "jobStatus": "In Queue"
}

Failure

{
    "code": "e003",
    "status": "Failed",
    "message": "Invalid JSON schema. The request structure must contain reportType, versionID, eventID, eventName, fileID fields."
}

{
    "code": "e003",
    "status": "Failed",
    "message": "Invalid fileID format. Accepted fileID format is ‘MMDDYYYY_HHMM’"
}

{
    "code": "e006",
    "status": "Failed",
    "message": "VersionID(s) does not exist."
}

{
    "code": "e008",
    "status": "Failed",
    "message": "EventID does not exist."
}

{
    "code": "e028",
    "status": "Failed",
    "message": "VersionID(s) are not in Completed status."
}

{
    "code": "e029",
    "status": "Failed",
    "message": "Event is not in Completed status."
}

{
    "code": "e030",
    "status": "Failed",
    "message": "Event is not tagged with versionID(s)."
}

### Codes
#### API

s007 - Request submitted successfully to SQS queue.  
s012 - Job initialization is in progress.  
e001 - Exception occurred in the process.  
e003 - Invalid json Schema.   
e005 - Error getting secret keys.      
e006 - VersionID(s) does not exist.  
e008 - EventID does not exist.
e013 - SQS operation failure.   
e028 - VersionID(s) are not in Completed status.  
e029 - Event is not in Completed status.  
e030 - Event is not tagged with versionID(s). 

```

## JobStatus

### Description -

This operation gets the status of job through POST method.

### URLs

Dev:  TBD
QA:   TBD

### Request

```
{
  "jobID": 1
}
```

### Response

Success
```
{
  "status": "Success",
  "code": "s007",
  "message": "Request processed succesfully",
  "jobId": 1,
  "jobStatus": "Completed",
  "downloadLink": "<signed url for download>",
}

{
    “code” :”s007", 
    “status” :”Success",
    “message”: "Request submitted Successfully to SQS queue",
    “jobID” : 6,
    “jobStatus” : “In Queue”
}


Failure
```

{
    "code": "e010",
    "status": "Failed",
    "message": "The requested jobID was not found"
}

{
  "code": "e022",
  "status": "Failed",
  "message": "Exceeded trial attempt. Please contact administrator.",
  "jobStatus": "Failed"
}

```

### Codes
#### API
s007 Request processed successfully.  
s007 Request submitted successfully to SQS queue.  
s012 Job initialization is in progress.  
e001 Exception occurred in the process.  
e003 jobID is required but was missing from request.  
e010 The requested jobID was not found.  
e022 Exceeded trial attempt. Please contact administrator.