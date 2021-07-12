/**
 * @summary: function to validate JSON object for required/ extra fields.
 * @description: Methods are used to validate the JSON schema and return response with code, status and message
 */

'use strict';

/**
 * function to check if input has extra or missing keys
 * @param {reqBodyJson} JSON parameter passed from controller
 * @param {resMessage} JSON parameter passed from controller
 * @returns {resMessage} Response message with code, message and status
*/

async function validateInputJSONSchema (reqBodyJson, resMessage) {
    try {
        // local variables
        let reportType = reqBodyJson.reportType;
        let versionID = reqBodyJson.versionID;
        let eventID = reqBodyJson.eventID;
        let eventName = reqBodyJson.eventName;
        let fileID = reqBodyJson.fileID;

        // if empty request received
        if (reqBodyJson === undefined || reqBodyJson === '' || reqBodyJson === null || !Object.keys(reqBodyJson).length) {
            resMessage['status'] = 'Failed';
            resMessage['code'] = 'e003';
            resMessage['message'] = 'Invalid JSON schema. The request structure must contain reportType, versionID, eventID, eventName, fileID fields.';
            return resMessage;
        }

        //reportType must be externalportalpackage for this API
        if (reportType !== 'externalportalpackage') {
            resMessage.status = 'Failed';
            resMessage.code = 'e003';
            resMessage.message = 'Invalid JSON schema. The requested report type should be \'externalportalpackage\'.';
            return resMessage;
        }

        //Check versionID type is array or not
        if (versionID !== undefined) {
            if (Array.isArray(versionID)) {
                if (versionID.length !== 0) {
                    for (let i = 0; i < versionID.length; i++) {
                        if (!Number.isInteger(versionID[i])) {
                            resMessage.status = 'Failed';
                            resMessage.code = 'e003';
                            resMessage.message = 'Invalid JSON schema. versionID ' +
                            versionID[i] + ' is not a number';
                            return resMessage;
                        }
                    }
                } 
                else {
                    resMessage.status = 'Failed';
                    resMessage.code = 'e003';
                    resMessage.message = 'Invalid JSON schema. versionID should not be empty\null';
                    return resMessage;
                }
            } 
            else {
                resMessage.status = 'Failed';
                resMessage.code = 'e003';
                resMessage.message = 'Invalid JSON schema. versionID list should be an array';
                return resMessage;
            }
        } 
        else {
            resMessage.status = 'Failed';
            resMessage.code = 'e003';
            resMessage.message = 'Invalid JSON schema. The request structure must have versionID input';
            return resMessage;
        }    
        
        // eventID validations. 
        if (eventID === undefined || eventID === null || typeof eventID !== 'number' || eventID < 1) {
            resMessage.status = 'Failed';
            resMessage.code = 'e003';
            resMessage.message = 'Invalid JSON schema. The requested evenID field must be a valid positive number.';
            return resMessage;
        }
        // eventID should not be an array list
        if (eventID !== undefined) {
            if (Array.isArray(eventID)) {
                resMessage.status = 'Failed';
                resMessage.code = 'e003';
                resMessage.message = 'Invalid JSON schema. The requested eventID field should not be an array.';
                return resMessage;
            }
        }

        // validate eventName
        if (eventName === undefined || eventName === null || typeof eventName !== 'string' || eventName === '') {
            resMessage.status = 'Failed';
            resMessage.code = 'e003';
            resMessage.message ='Invalid JSON schema. The requested eventName field must be a valid string value.';
            return resMessage;
        }

        // validate fileID format. Format should be MMDDYYYY_HHMM
        const regExPattern = /([0-9]{8})_([0-9]{4})/;

        if (fileID === undefined || !(regExPattern.test(fileID) && fileID.length === 13)) {
            resMessage.status = 'Failed';
            resMessage.code = 'e003';
            resMessage.message = 'Invalid fileID format. Accepted fileID format is ‘MMDDYYYY_HHMM’';
            return resMessage;
        }    
    }   catch (error) {
            resMessage.code = 'e001';
            resMessage.status = 'Failed';
            resMessage.message = 'Exception occurred while validating JSON schema. ' + error.stack;
            console.error({'Exception occurred while validating JSON schema.': error.stack,});
            return resMessage;     
        }
    return resMessage;   
}

/**
 * function to check if input has extra or missing keys
 * @param {reqBodyJson} JSON parameter passed from controller
 * @param {requiredInputSchema} JSON parameter passed from controller
 * @param {resMessage} JSON parameter passed from controller
 * @returns {resMessage} Response message with code, message and status
*/
async function validateInputKeys (reqBodyJson, requiredInputSchema, resMessage) {
    try {
        // local variables
        let invalidFields = [];

        // validation for the mandatory fields
        Object.keys(requiredInputSchema).forEach(key => {
            if (!reqBodyJson.hasOwnProperty(key)) {
                invalidFields.push(key);
                resMessage.status = 'Failed';
            }
        });
        
        if (resMessage.status === 'Failed') {
            resMessage.code = 'e003';
            resMessage.message = `Invalid JSON schema. The request structure is missing '${invalidFields.join(',')}' field(s).`;
            return resMessage;
        } 

        // check if request body has any extra keys other than the required input schema
        Object.keys(reqBodyJson).forEach(key => {
            if (Object.keys(requiredInputSchema).indexOf(key) < 0) {
                invalidFields.push(key);
                resMessage.status = 'Failed';
            }
        });    

        if (resMessage.status === 'Failed') {
            resMessage.code = 'e003';
            resMessage.message = `Invalid JSON schema. The request structure has extra '${invalidFields.join(',')}' field(s).`;
            return resMessage;
        }   
    }
    catch (error) {
        resMessage.code = 'e003';
        resMessage.message = 'Exception occurred in validation ' + error;
        resMessage.status = 'Failed';
        console.error({'Exception occurred while validating JSON schema.': error.stack,});
        return resMessage;
    }
}

// Exports
exports.validateInputKeys = validateInputKeys;
exports.validateInputJSONSchema = validateInputJSONSchema;