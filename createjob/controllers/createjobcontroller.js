/**
 * @summary: Controller class hold the main API logic.
 * @description: This method accepts the input request from the route (createjob.js), validates the input and call
 * model to execute DB function for creating job.
 */

'use strict';

// Import all dependencies
const HttpStatus = require('http-status-codes');
const config = require('../config');
const geomartValidation = require('../models/geomartvalidation');
const awsSecretManager = require('../models/geomartsecretmanager');
const geomartDB = require('../models/geomartpostgres');
const sqsQueue = require('../models/geomartsqs');
const sortedVersionID = require('../models/geomartsortarraylist');

/**
 * Get createjob controller
 * @param {JSON} req containing reportType, versionID, eventID, eventName, fileID
 * @returns {JSON} res containing with code, status,message, jobID, jobStatus to the client.
 */
exports.createJob = async function (req, res) {
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
    let resMessage = {
        code: '',
        status: '',
        message: ''
    };
    let getVersionList = {};
    let pool = null;
    let errorMsg = null;
    let createjobResult = null;
    let createJobResponse = null;
    let updateJobResponse = null;
    let dbConnectionParameters = null;

    // mandatory fields
    const requiredInputSchema = {
        reportType: '',
        versionID: [],
        eventID: 0,
        eventName: '',
        fileID: ''
    };

    if (reqBodyJson) {
        try {
            // Validate the input request for extra/required keys
            await geomartValidation.validateInputKeys(reqBodyJson, requiredInputSchema, resMessage);
            if (resMessage.status === 'Failed') {
                // log the message in AWS cloud watch
                console.log({ 'Validation error:': resMessage.message });

                // Return the response with failed status to the client
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage)
                );
            }

            // Validate the input key fields value
            await geomartValidation.validateInputJSONSchema(reqBodyJson, resMessage);

            // Exit if validation failed
            if (resMessage.status === 'Failed') {
                // log the message in AWS cloud watch
                console.log({ 'Validation error:': resMessage.message });

                // Return the response with failed status to the client
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage)
                );
            }
            // get sorted version list
            if (reqBodyJson.versionID.length > 0) {
                getVersionList = await sortedVersionID.sortArrayList(reqBodyJson.versionID); 
                reqBodyJson.versionID = getVersionList;
            }
        
            // Get the secret key
            dbConnectionParameters = await awsSecretManager.getSecretKey(config.aws.SECRET_ID);
                
            if (dbConnectionParameters !== null){
                // Create the database pool
                pool = await geomartDB.getPostgresConnectionPool(dbConnectionParameters);  
            }
            if (pool !== null) {
                // Call the DB function for creating job 
                createjobResult = await geomartDB.executeQuery(pool, config.storedProcedure.CREATE_JOB, JSON.stringify(req.body));
                createJobResponse = JSON.parse(JSON.stringify(createjobResult.rows[0].api_createeppackagejob_v1));
                
                // return message if createjob status failed log the message.
                if (createJobResponse.status === 'Failed') {
                    // log the message in AWS cloud watch
                    console.log({'Job creation failed with following results. ': createJobResponse});
                    
                    // Return the response with failed status to the client
                    return res.status(HttpStatus.OK).send(
                        JSON.stringify(createJobResponse)
                    );
                }  
            }
            else {
                // DB connection failure
                resMessage.code = 'e009';
                resMessage.status = 'Failed';
                resMessage.status = 'Failed to establish database connection.';

                // log the message in AWS cloud watch
                console.log({ 'DB connection error:': resMessage.message });
    
                // Return the response with failed status
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage)
                );
            }
            if (createJobResponse.sqs === 'false') {
                resMessage.status = 'Success';
                resMessage.code = 's007';
                resMessage.jobId = createJobResponse.jobId;
                resMessage.jobStatus = createJobResponse.jobStatus;                    
                resMessage.message = 'Request with same version(s) exists.';

                // log the message in AWS cloud watch
                console.log({'Message send to the client': resMessage.message});

                // Return the response back to the client
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(resMessage)
                );
            }
            else
            {
                // Send message to SQS queue
                let sqsMessage = {
                    status: 'Success',
                    code: 's007',
                    message: 'Request submitted successfully to SQS queue',
                    reportType: reqBodyJson.reportType,
                    jobId: createJobResponse.jobId,
                    jobStatus: 'In Queue',
                };

                console.log({'SQS message ': sqsMessage});
                    
                // Send message to SQS queue
                const isSqsSuccess = await sqsQueue.sendSqsMessage(sqsMessage);

                // Call DB to update job status
                updateJobResponse = await geomartDB.updateJobStatus(pool, isSqsSuccess, createJobResponse.jobId);

                // Return the response back to the client
                return res.status(HttpStatus.OK).send(
                    JSON.stringify(updateJobResponse)
                );
            }
        } 
        catch (error) {
            if (error !== undefined && error.code !== undefined && error.code === '57014') {
                errorMsg = 'Request exceeded the time limit';
            } else {
                errorMsg = 'Exception occurred in the process. ';
            }
            console.error({ 'Exception ': errorMsg + error.stack });
            resMessage.status = 'Failed';
            resMessage.message = errorMsg + error.stack;
            resMessage.code = 'e001';
            return res.status(HttpStatus.BAD_REQUEST).send(JSON.stringify(error));
        }
        finally {
            await geomartDB.releasePool(pool);
        }
    } 
};