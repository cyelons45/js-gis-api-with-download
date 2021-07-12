/**
 * Summary: Class for managing aws sqs messages.
 * Description: Method to send message to aws sqs queue.
 */

'use strict';

const AWS = require('aws-sdk');
var https = require('https');
const config = require('../config');

/**
 * function to send message to sqs queue
 * @param {json} sqs message
 * @returns {boolean} Yes- Message sent successfully to sqs. false- Failed to send message to sqs queue.
*/
async function sendSQSMessage (sqsMessage) {
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
exports.sendSQSMessage = sendSQSMessage;