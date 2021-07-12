/**
 * Summary: Class to get signed S3 URL
 * Description: Methods in this class are used to get S3SignedURL and return response with downloadURL
 */

'use strict';

const config = require('../config');
const https = require('https');
const AWS = require('aws-sdk');

/**
 * function to get signed url for downloading files
 * @author Vani Chaitanya VCS5
 * @param downloadURL: report complete s3 file path
 * @returns signed download url in string
 */
async function getS3SignedURL (downloadURL) {
    try {
      if (config.isLocalEnv) {
        let credentials = new AWS.SharedIniFileCredentials({
          profile: 'GISCOE-Dev' //config.aws.AWS_PROFILE
        });
        AWS.config.credentials = credentials;
  
        AWS.NodeHttpClient.sslAgent = new https.Agent({
          rejectUnauthorized: false
        });
      }
  
      const s3 = new AWS.S3();
  
      var filePathArray = downloadURL.split('/');
      let bucketName = filePathArray[2].split('.')[0];
      // Check if bucket exists
      let isBucketExists = await bucketExists(bucketName, s3);
  
      if (!isBucketExists) {
        return false;
      }
  
      let resultString = '';
      filePathArray.forEach(subFolder => {
        if (filePathArray[2] !== subFolder && filePathArray[0] !== subFolder) {
          resultString += subFolder + '/';
        }
      });
      let bucketFullPath = resultString.slice(1, -1);
  
      const params = {
        Bucket: bucketName,
        Key: bucketFullPath,
        Expires: config.s3TokenExpirationTime
      };
      return new Promise((resolve, reject) => {
        s3.getSignedUrl('getObject', params, (err, url) => {
          if (err) {
            console.error({ 'Error: Failed to generate s3 signed url.': err });
            reject(err);
            return false;
          } else resolve(url);
          return url;
        });
      });
    } catch (error) {
      console.error({'Exception occurred while generating s3 signed url ': error.stack});
      return false;
    }
  }
  

/**
 * function to check if s3 bucket exists
 * @author Vani Chaitanya VCS5
 * @param s3FilePath: report complete s3 file path
 * @param s3 : s3 object reference
 * @returns true - file exists in provided s3 bucket path
 * @returns false- file not exists in provided s3 bucket path  
 */
async function bucketExists (s3FilePath, s3) {
  const options = {
    Bucket: s3FilePath
  };
  try {
    await s3.headBucket(options).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
  }
}

exports.getS3SignedURL = getS3SignedURL;