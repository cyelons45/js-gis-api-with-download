/**
 * @summary: function to send message to SQS queue.
 * @description: This function is used to send message to SQS queue and return boolean false or true.
 */

'use strict';

const AWS = require('aws-sdk');
const config = require('../config');
const https = require('https');

/**
 * function to send message to SQS queue
 * @param {sqsMessage} SQS message in JSON
 * @returns {bool} true-  Message sent successfully to SQS queue or false- Failed to send message to SQS
*/
async function sendSqsMessage (sqsMessage) {
    let sqs = null;
  
    try {
      // Set AWS region
      AWS.config.region = config.aws.AWS_REGION;
      AWS.NodeHttpClient.sslAgent = new https.Agent({ rejectUnauthorized: false });
  
      // Append environment detail to sqs message
      sqsMessage['environment'] = config.env.toUpperCase();
  
      // sqs parameters
      let params = {
        DelaySeconds: 10,
        MessageBody: JSON.stringify(sqsMessage),
        QueueUrl: config.sqsQueue
      };
  
      // Initialize sqs
      sqs = new AWS.SQS();
  
      return new Promise((resolve, reject) => {
        sqs.sendMessage(params, function (err, data) {
          if (err) {
            // SQS message failed
            console.error({ 'Error occured while sending message to sqs queue : ': err });
            reject(err);
            return false;
          } else {
            // SQS message success
            console.info({ 'Message sent successfully to sqs with message Id : ': data.MessageId });
            resolve(data);
            return true;
          }
        });
      });
    } catch (error) {
      console.error({ 'Exception occurred while sending message to SQS message. ': error.stack });
      return false;
    }
  }
  
  // Exports
  exports.sendSqsMessage = sendSqsMessage;