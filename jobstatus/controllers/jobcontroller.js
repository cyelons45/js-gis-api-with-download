/**
 * Summary: Controller class hold the main API logic.
 * Description: Methods in this class accepts the input request from the route (jobstatus.js), validates the input and call
 * model to execute DB function to retrieve job status.
 */

'use strict';

// Import all dependencies
const HttpStatus = require('http-status-codes');
const config = require('../config');
const geomartValidation = require('../models/geomartvalidation');
const awsSecretManager = require('../models/geomartsecretmanager');
const geomartDB = require('../models/geomartpostgres');
const geomartSqs = require('../models/geomartsqs');
const geomartAWS = require('../models/geomartaws');

/*
 * @param {req} Accepts the request in JSON format from route. JSON object must contain jobID field.
 * @returns {res} JSON object with code, status, message, log and downloadLink to the client.
 */
exports.jobStatus = async function (req, res) {
    if (!config.isLocalEnv) {
        res.cors({
            origin: '*'
        });
    }

    // Set response header
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');

    // Local variables
    let reqBodyJson = req.body;
    let jobStatusResult = null;
    let dbConnectionParameters = null;
    let dbFunctionResponse = null;
    let pool = null;
    let errorMsg = null;
    let sqsMessage =null;

    // Required fields in input request
    const requiredKeys = {
        jobID: ''
    };

    // Accepted fields in input request
    const allAcceptedKeys = {
        jobID: ''
    };

    // Response message
    let resMessage = {
        code: '',
        status: '',
        message: '',
        jobStatus:'',
        downloadLink: ''
    };

    try {
        console.log(JSON.stringify({'jobStatus ': 'Request received'}));
        console.log(JSON.stringify({'jobStatus ': 'Validation started'}));
        // Validate the input request for extra/required keys
        await geomartValidation.validateInputKeys(reqBodyJson, requiredKeys, allAcceptedKeys, resMessage);
        if (resMessage.status === 'Failed') {
            return res.status(HttpStatus.OK).send(
                JSON.stringify(resMessage)
            );
        }

        // Validate the jobID field value
        await geomartValidation.validateInputJSONSchema(reqBodyJson, resMessage);

        // Exit if validation failed
        if (resMessage.status === 'Failed') {
            resMessage.code = 'e003';
            resMessage.message = resMessage.message;
            resMessage.status = 'Failed';

            console.log({ 'Validation failed': JSON.stringify(resMessage) });
            // Return the response with failed status
            return res.status(HttpStatus.OK).send(
                JSON.stringify(resMessage)
            );
        }
        console.log(JSON.stringify({'jobStatus ': 'Validation completed'}));

        // Get the database connection parameters from aws secret manager
        dbConnectionParameters = await awsSecretManager.getSecretKey(config.aws.SECRET_ID);

        if (dbConnectionParameters !== null) {
            // Create the database pool
            pool = await geomartDB.getPostgresConnectionPool(dbConnectionParameters);
        }

        if (pool !== null) {
            // Append jobRunTime parameter from config
            reqBodyJson['jobRuntime'] = config.jobRuntime;

            // Call the DB function to get job status
            jobStatusResult = await geomartDB.executeQuery(pool,
                 config.storedProcedure.JOB_STATUS, JSON.stringify(reqBodyJson));

            dbFunctionResponse = JSON.parse(JSON.stringify(jobStatusResult.rows[0].api_eppackagejobstatus_v1));

            resMessage.code = dbFunctionResponse.code;
            resMessage.status = dbFunctionResponse.status;
            resMessage.message = dbFunctionResponse.message;
            resMessage.jobStatus = dbFunctionResponse.jobStatus;
            resMessage.downloadLink = dbFunctionResponse.downloadLink;

            // Exit if db function exception or validation failed
            if (dbFunctionResponse.status === 'Failed' ) {
                resMessage.code = 'e003';
                resMessage.message = dbFunctionResponse.message;
                resMessage.status = 'Failed';
                resMessage.jobID = reqBodyJson.jobID;
                console.log(JSON.stringify({
                    'Failed to retrieve job status ': dbFunctionResponse
                }));
                // Return the response with failed status
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage)
                );
            }
            console.log(JSON.stringify({'jobStatus ': 'Job status is - ' + resMessage.jobStatus}));

            //Get the download URL
            if (dbFunctionResponse.jobStatus.toUpperCase() === 'COMPLETED' && dbFunctionResponse.downloadLink !== '') {
                console.log(JSON.stringify({'jobStatus ': 'Generating signed url'}));
                let s3SignedDownloadLink = await geomartAWS.getS3SignedURL(dbFunctionResponse.downloadLink);
                
                 if (s3SignedDownloadLink) {
                      console.log(JSON.stringify({'jobStatus ': 'Signed url generated successfully'}));
                      resMessage.downloadLink = s3SignedDownloadLink;
                 } else {
                    resMessage.code = 'e024';
                    resMessage.status = 'Failed';
                    resMessage.message = 'Invalid file download link';
                    resMessage.jobStatus = dbFunctionResponse.jobStatus;
                    resMessage.downloadLink = '';
                }
            }
            // Send the message to sqs queue only when isSqs value is true
            if (dbFunctionResponse.sqs) {                
                 // Send message to SQS queue
                console.log(JSON.stringify({'jobStatus ': 'Sending message to SQS queue'}));
                sqsMessage = {
                    status: 'Success',
                    code: 's007',
                    message: 'Request submitted successfully to SQS queue',
                    reportType: dbFunctionResponse.reportType,
                    jobId: reqBodyJson.jobID,
                    jobStatus: 'In Queue',
                };

                console.log(JSON.stringify({'SQS message ': sqsMessage}));

                // Send message to sqs queue
                let isMessageSent = await geomartSqs.sendSQSMessage(sqsMessage);

                // Update job status
                await geomartDB.updateJobStatus(pool, isMessageSent, reqBodyJson.jobID);

                if (isMessageSent) {
                    resMessage.code = 'S007';
                    resMessage.status = 'Success';
                    resMessage.message = 'Request submitted Successfully to SQS queue';
                    resMessage.jobID = reqBodyJson.jobID;
                    resMessage.jobStatus ='In Queue';
                }
                else {
                    resMessage.code = 'e013';
                    resMessage.status = 'Failed';
                    resMessage.message = 'Failed to send message to sqs queue';
                    resMessage.jobID = reqBodyJson.jobID;
                }
                
                // Send response back to client
                return (res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage))
                );
            }
            else {
                // Send response back to client
                return (res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage))
                );
            }
        }
        else {
            // DB connection failure
            console.log(JSON.stringify({'jobStatus ': 'Failed to establish database connection.'}));
            resMessage.code = 'e009';
            resMessage.status = 'Failed';
            resMessage.status = 'Failed to establish database connection.';

            // Return the response with failed status
            return (res.status(HttpStatus.OK).send(
                JSON.stringify(resMessage))
            );
        }
    }
    catch (error) {
        // Return the time out message when time exceeded the threshold limit of 25 secs or defined in config. 
        if (error !== undefined && error.code !== undefined && error.code === '57014') {
            errorMsg = 'Request exceeded the time limit. ';
        } else {
            errorMsg = 'Exception occurred while retrieving job status. ';
        }
        console.error(JSON.stringify({ 'Exception ': errorMsg + error.stack }));
        resMessage.status = 'Failed';
        resMessage.message = errorMsg;
        resMessage.code = 'e001';
        return res.status(HttpStatus.BAD_REQUEST).send(
            JSON.stringify(error));
    }
    finally {
        // Close the db connection pool
        await geomartDB.releasePool(pool);
    }
};
