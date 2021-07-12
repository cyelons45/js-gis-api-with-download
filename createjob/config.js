/**
* @summary: Config files contains all constant values.
* @description: This file contains all constant values at one place.
*/

'use strict';

//this brings in the environment variable
require('dotenv').config();

const _storedProcedure = {
  CREATE_JOB: 'SELECT * FROM psps.api_createeppackagejob_v1($1)',
  UPDATE_JOB: 'SELECT * FROM psps.api_updateeppackagejob_v1($1)'
};

// Timeout the DB connection within 25 secs
const _defaultQryTimeout = 25000;

const _awslocal = {
  SECRET_ID: 'dev/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: 'GISCOE-Dev'
};

const _awsTst = {
  SECRET_ID: 'tst/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: ''
};

const _awsQa = {
  SECRET_ID: 'qa/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: ''
};

const _awsProd = {
  SECRET_ID: 'prod/psps/db_eppackageapi',
  AWS_REGION: 'us-west-2',
  AWS_PROFILE: ''
};

const LOCAL = {
  aws: _awslocal,
  storedProcedure: _storedProcedure,
  defaultQryTimeout : _defaultQryTimeout,
  port: 3000,
  isLocalEnv: true,
  sqsQueue : 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_dev',
  env :'dev'
};

const DEV = {
  aws: _awslocal,
  storedProcedure: _storedProcedure,
  defaultQryTimeout : _defaultQryTimeout,
  isLocalEnv: false,
  sqsQueue : 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_dev',
  env :'dev'
};

const TST = {
  aws: _awsTst,
  storedProcedure: _storedProcedure,
  defaultQryTimeout : _defaultQryTimeout,
  isLocalEnv: false,
  sqsQueue : 'https://sqs.us-west-2.amazonaws.com/412551746953/psps_eppackage_tst',
  env :'tst'
};

const QA = {
  aws: _awsQa,
  storedProcedure: _storedProcedure,
  defaultQryTimeout : _defaultQryTimeout,
  isLocalEnv: false,
  sqsQueue : 'https://sqs.us-west-2.amazonaws.com/719465802387/psps_eppackage_qa',
  env :'qa'
};

const PROD = {
  aws: _awsProd,
  storedProcedure: _storedProcedure,
  defaultQryTimeout : _defaultQryTimeout,
  isLocalEnv: false,
  sqsQueue : 'https://sqs.us-west-2.amazonaws.com/215900123988/psps_eppackage_prod',
  env :'prod'
};

/**
 * Do not put quotes on below DEV, TST etc... as they are the variables of the above objects
 * @returns config containing the storedProcedure and the associated environment object
 * *********************************************************************************************
 */
const config =
{
  LOCAL,
  DEV,
  TST,
  QA,
  PROD
};

module.exports = config[process.env.NODE_ENV];
