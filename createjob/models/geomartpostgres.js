/**
 * @summary: function to connect PostGreSQL and execute query.
 * @description: Methods are used to connect PostGreSQL and execute queries and DB function .
 */

'use strict';

const config = require('../config');
const Pool = require('pg').Pool;

/**
 * function to get database connection pool
 * @param {connectionParameters} DB connection parameters user, host, database, password
 * @returns DB Connection pool object
*/
async function getPostgresConnectionPool (connectionParameters) {
    let pool = null;
    try {
        connectionParameters = JSON.parse(connectionParameters);

        // Create database pool using connection parameters
        pool = new Pool({
            user: connectionParameters.username,
            host: connectionParameters.primarydb,
            database: connectionParameters.dbname,
            password: connectionParameters.password,
            statement_timeout: config.defaultQryTimeout
        });
        return pool;
    } catch (error) {
        console.error({'Error occurred while getting PostgreSQL DB connection pool ': error.stack});
        return pool;
    }
}

/**
 * function to execute DB function or Query
 * @param {pool} DB connection pool object
 * @param {dbFunctionName} DB function name.
 * @param {queryString} Query parameters. These are the parameters appended with DB function
 * @returns {queryResult} DB function output object
*/
async function executeQuery (pool,dbFunctionName, queryString) {
    return new Promise((resolve, reject) => {
        pool
            .query(dbFunctionName, [queryString])
            .then((res) => {
                // Send back the db function or query response
                resolve(res);
            })
            .catch((err) => {
                // Log the error
                console.log(err);
                reject(err);
            });
    });
}

/**
 * function to end database connection pool exclusively
 * @param {pool} DB connection pool object 
*/
async function releasePool (pool) {
    try {
        //Release pool exclusively
        if (pool !== null && pool !== undefined)
            pool.end();
    } catch (error) {
        console.error({
            'Exception occurred while ending pool. ': error.stack
        });
    }
}

/*
 * This function update job status in database.
 * @@param {pool} db connection pool
 * @returns {bool} true- Message sent successfully to sqs queue, false- Message failed
 */
async function updateJobStatus (pool, isMessageSent, jobID) {
    try {
        let dbMessage = {
            status: '',
            code: '',
            jobStatus: '',
            message: '',
            jobId: '',
            trialIncrement: false
        };
        let updateJobResult = null;
        let updateJobResponse = null;

        // Update the job with Failed status
        if (!isMessageSent) {
            dbMessage.status = 'Failed';
            dbMessage.code = 'e013';
            dbMessage.jobStatus = 'Failed';
            dbMessage.message = 'Failed to send message to SQS queue.';
            dbMessage.jobId = jobID;

            // Update job with failed status
            updateJobResult = await executeQuery(pool, config.storedProcedure.UPDATE_JOB, JSON.stringify(dbMessage));
            updateJobResponse = JSON.parse(JSON.stringify(updateJobResult.rows[0].api_updateeppackagejob_v1));

            // return message if updatejob status failed and log the message.
            if (updateJobResponse.status === 'Failed') {
                // log the message in AWS cloud watch
                console.error({'Job updation failed with following results. ': updateJobResponse});
                return updateJobResponse;
            }
        }
        else {
            // Update the job with success status
            dbMessage.status = 'Success';
            dbMessage.code = 's007';
            dbMessage.jobStatus = 'In Queue';
            dbMessage.message = 'Request submitted Successfully to SQS queue.';
            dbMessage.jobId = jobID;
            
            // Update job with success status
            updateJobResult = await executeQuery(pool, config.storedProcedure.UPDATE_JOB, JSON.stringify(dbMessage));
            updateJobResponse = JSON.parse(JSON.stringify(updateJobResult.rows[0].api_updateeppackagejob_v1));
            
            // return message if updatejob status failed and log the message.
            if (updateJobResponse.status === 'Failed') {
                // log the message in AWS cloud watch
                console.error({'Job updation failed with following results. ': updateJobResponse});
                return updateJobResponse;
            }
        }
        return updateJobResponse;
    } catch (error) {
        console.error({
            'Exception occurred while updating job status. ': error.stack,
        });
    }
}

// Exports
exports.getPostgresConnectionPool = getPostgresConnectionPool;
exports.executeQuery = executeQuery;
exports.releasePool = releasePool;
exports.updateJobStatus = updateJobStatus;