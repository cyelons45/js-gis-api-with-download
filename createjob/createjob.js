/**
 * @summary: Main API route file.
 * @description: This file exposes the API route using POST method and provides ability to run the API in both
 * local and AWS Lambda environment.
 */

'use strict';
const config = require('./config');
const cors = require('cors');

// Import controller
const createJobController = require('./controllers/createjobcontroller');

let api = null;

/**
 * The conditional on config.isLocalEnv establishes the api object for use in a local or AWS environment.
 * @returns {api} created to operate either locally using express or in AWS using a Lambda function.
 */
if (config.isLocalEnv) {
    const bodyParser = require('body-parser');
    const express = require('express');

    api = express();
    api.use(cors());

    api.use(bodyParser.urlencoded({extended: false}));

    api.use(bodyParser.json());
    
    // Run the API in local development environment
    let consoleMessage = `/eppackage/createjob API is running on port ${config.port} from the ${config.isLocalEnv ? 'LOCAL' : 'NON-LOCAL'} environment!`;
    api.listen(config.port, () => console.log({
        consoleMessage
    }));
} else {
    //Run the API in AWS Lambda 
    api = require('lambda-api')();

    // Lambda handler 
    exports.handler = async (createJob, context) => {
    // Run the request
    return await api.run(createJob, context);
    };
}

/*
 * API route sending HTTP request to controller.
 * Controller createJobController.createJob accepts request in JSON format.
 */
api.post('/eppackage/createjob', createJobController.createJob);
