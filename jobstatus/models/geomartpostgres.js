/**
 * Summary: Class to connect PostGreSQL and execute query.
 * Description: Methods in this class are used to connect PostGreSQL and execute queries and DB function.
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
        console.log({'Error occurred while getting PostgreSQL DB connection pool ': error.stack});
        return pool;
    }
}

/**
 * function to execute DB function or Query
 * @param {pool} DB connection pool object
 * @param {dbFunctionName} DB function name. example psps.getstatus
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
 * @param {pool} DB connection pool  
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
async function updateJobStatus (pool,isMessageSent, jobID) {
    let dbMessage = {
        code: '',
        jobStatus: '',
        message: '',
        jobId: '',
        trialIncrement: ''
    };

    try {
        // Update the job with Failed status
        if (!isMessageSent) {
            dbMessage.code = 'e013';
            dbMessage.jobStatus = 'Failed';
            dbMessage.message = 'Failed to send message to SQS queue.';
            dbMessage.jobId = jobID;
            dbMessage.trialIncrement = true;

            // Update job with failed status
            await executeQuery(pool, config.storedProcedure.JOB_UPDATE, JSON.stringify(dbMessage));
        }
        else {
            // Update the job with success status
            dbMessage.code = 's007';
            dbMessage.jobStatus = 'In Queue';
            dbMessage.message = 'Request submitted Successfully to SQS queue.';
            dbMessage.jobId = jobID;
            dbMessage.trialIncrement = true;

            // Update job with success status
            await executeQuery(pool, config.storedProcedure.JOB_UPDATE, JSON.stringify(dbMessage));
        }
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