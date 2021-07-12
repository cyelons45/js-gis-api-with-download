/**
 * @summary: function to connect AWS secret manager.
 * @description: Methods are used to connect AWS secret manager for retrieving DB connection details.
 */
'use strict';

// Load required libraries
const AWS = require('aws-sdk');
const config = require('../config');
var https = require('https');

/**
 * function to get database connection details from aws secret manager
 * @param {secretName} secretName example 'dev/psps/db_eppackageapi'
 * @returns database connection in key/value pair
*/
async function getSecretKey (secretName) {
    let keyValues = null;

    try {
        if (config.isLocalEnv) {
            let credentials = new AWS.SharedIniFileCredentials({
                profile: config.aws.AWS_PROFILE
            });
            AWS.config.credentials = credentials;
            AWS.NodeHttpClient.sslAgent = new https.Agent({
                rejectUnauthorized: false
            });
        }
        // Create a Secrets Manager client
        let client = new AWS.SecretsManager({
            region: config.aws.AWS_REGION
        });

        return new Promise((resolve, reject) => {
            client.getSecretValue({
                SecretId: secretName
            }, function (err, data) {
                if (err) {
                    console.error('Error: Failed to fetch details from AWS secret manager.');
                    reject(err);
                    return keyValues;
                } else {
                    // Decrypts secret using the associated KMS CMK.
                    // If secret is in string format
                    if ('SecretString' in data) {
                        resolve(data.SecretString);
                        keyValues = JSON.parse(data.SecretString);
                        console.log('Success: Successfully fetch the details from AWS secret manager.');
                        return keyValues;
                    } else { // If secret is in binary format
                        let buff = new Buffer(data.SecretBinary, 'base64');
                        resolve(buff.toString('ascii'));
                        return keyValues;
                    }
                }
            });
        });
    } catch (error) {
        console.log({'Error occurred while getting secret key ': error.stack});
        return keyValues;
    }
}

// Exports
exports.getSecretKey = getSecretKey;