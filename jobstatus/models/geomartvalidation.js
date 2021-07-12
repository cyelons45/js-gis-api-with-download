/**
 * Summary: Class to validate JSON object for required/ extra fields.
 * Description: Methods in this class are used to validate the JSON schema and return response with code, status and message
 */

'use strict';

/**
 * function to check if input has extra or missing keys
 * @param {reqBodyJson} Input request received by client
 * @param {requiredKeys} Required keys JSON object
 * @param {resMessage} Response message with code, status and message
 * @returns {resMessage} Response message with code, message and status
*/
async function validateInputKeys (reqBodyJson, requiredKeys, allAcceptedKeys, resMessage) {
    try {
        // Check if request body has extra keys other than mandatory fields.
        Object.keys(reqBodyJson).forEach(key => {
            if (!requiredKeys.hasOwnProperty(key)) {
                if (!allAcceptedKeys.hasOwnProperty(key)){
                    resMessage.code = 'e003';
                    (resMessage.message.length === 0 || resMessage.message === '') ?
                        resMessage.message = `Request body having extra ${key} property.` :
                        resMessage.message += `|| Request body having extra ${key} property.`;
                    resMessage.status = 'Failed';
                }
            }
        });
        // Step one check if request body is missing mandatory Keys. 
        Object.keys(requiredKeys).forEach(key => {
            if (!reqBodyJson.hasOwnProperty(key)) {
                resMessage.code = 'e003';
                (resMessage.message.length === 0 || resMessage.message === '') ?
                    resMessage.message = `Request body is missing ${key} property.` :
                    resMessage.message += `|| Request body is missing ${key} property.`;
                resMessage.status = 'Failed';
            }
        });
    }
    catch (error) {
        resMessage.code = 'e003';
        resMessage.message = 'Exception occurred in validation ' + error;
        resMessage.status = 'Failed';
    }
}

/*
 * This function validates the input request fields and values.
 * @@param {reqBodyJson} in JSON format. JSON object with jobID
 * @returns {resMessage} JSON object with code, status and message.
 */
async function validateInputJSONSchema (reqBodyJson, resMessage) {
    let jobID = null;
    try {
        jobID = reqBodyJson.jobID;

        //check if request body key is an array, null, invlaid type, float, or a jobID less than 1
        if (Array.isArray(jobID)) {
            resMessage.message = 'jobID must be a single number, not an array.';
        } else if (jobID === null) {
            // is null
            resMessage.message = 'jobID must not be empty.';
        } else if (typeof jobID !== 'number') {
            // is not a number type
            resMessage.message = `jobID must be a number. The jobID was passed as a ${typeof jobID}.`;
        } else if (!Number.isInteger(jobID)) {
            // is a float
            resMessage.message = 'jobID must be a number.';
        } else if (jobID < 1) {
            // is less than 1
            resMessage.message = 'jobID must be greater than zero.';
        }

        // Return the response
        if (resMessage.message !== '') {
            resMessage.code = 'e003';
            resMessage.status = 'Failed';
        }
    } catch (error) {
        console.error({
            'Exception occurred while validating job status request. ': error.stack,
        });
    }
}

// Exports
exports.validateInputKeys = validateInputKeys;
exports.validateInputJSONSchema = validateInputJSONSchema;