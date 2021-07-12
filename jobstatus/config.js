/**
 * Summary: API configuration file.
 * Description: This class contains the configuration for AWS and various environments
 */

'use strict';

require('dotenv').config(); 

// DB function used for retrieving the job status
const _storedProcedure = {
  JOB_STATUS: 'SELECT * FROM psps.api_eppackagejobstatus_v1($1)',
  JOB_UPDATE: 'SELECT * FROM psps.api_updateeppackagejob_v1($1)'
};

// Maximum allowable time limit for job
const _maxAllowedJobRuntime = 90; 

// Timeout the DB connection within 25 secs
const _defaultQryTimeout = 25000;

// in seconds. 1800 = 30 min
const _expirationTime = 1800; 

//AWS details
const _awslocal = {
  SECRET_ID: 'dev/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: 'GISCOE-Dev',
};

const _awsTst = {
  SECRET_ID: 'tst/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: '',
};

const _awsQA = {
  SECRET_ID: 'qa/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: '',
};

const _awsProd = {
  SECRET_ID: 'prod/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: '',
};


//Environment details
const LOCAL = {
  aws: _awslocal,
  storedProcedure: _storedProcedure,
  jobRuntime: _maxAllowedJobRuntime,
  s3TokenExpirationTime: _expirationTime,
  isLocalEnv: true,
  sqsQueue: 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_dev',
  env: 'dev',
  port: 3000,
  defaultQryTimeout: _defaultQryTimeout
};

const DEV = {
  aws: _awslocal,
  storedProcedure: _storedProcedure,
  jobRuntime: _maxAllowedJobRuntime,
  s3TokenExpirationTime: _expirationTime,
  isLocalEnv: false,
  sqsQueue: 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_dev',
  env: 'dev',
  defaultQryTimeout: _defaultQryTimeout
};

const TST = {
  aws: _awsTst,
  storedProcedure: _storedProcedure,
  jobRuntime: _maxAllowedJobRuntime,
  s3TokenExpirationTime: _expirationTime,
  isLocalEnv: false,
  sqsQueue: 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_tst',
  env: 'tst',
  defaultQryTimeout: _defaultQryTimeout
};

const QA = {
  aws: _awsQA,
  storedProcedure: _storedProcedure,
  jobRuntime: _maxAllowedJobRuntime,
  s3TokenExpirationTime: _expirationTime,
  isLocalEnv: false,
  sqsQueue: 'https://sqs.us-west-2.amazonaws.com/719465802387/psps_eppackage_qa',
  env: 'qa',
  defaultQryTimeout: _defaultQryTimeout
};

const PROD = {
  aws: _awsProd,
  storedProcedure: _storedProcedure,
  jobRuntime: _maxAllowedJobRuntime,
  s3TokenExpirationTime: _expirationTime,
  isLocalEnv: false,
  sqsQueue: 'https://sps.us-west-2.amazonaws.com/215900123988/psps_eppackage_prod',
  env: 'prod',
  defaultQryTimeout: _defaultQryTimeout
};

/**
 * Do not put quotes on below DEV, TST etc. They are the environment specific variables.
 * @returns config containing the storedProcedure and the associated environment object
 */
const config =
{
  LOCAL,
  DEV,
  TST,
  QA,
  PROD
};

// Exports
module.exports = config[process.env.NODE_ENV];