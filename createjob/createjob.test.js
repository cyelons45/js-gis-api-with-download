/**
 * @summary: Unit test class.
 * @description: Executes the unit test for eppackage createjob API. Code coverage is only for validating input. 
 */
'use strict';

const sortArrayList = require('./models/geomartsortarraylist');
const { sendSqsMessage } = require('./models/geomartsqs');
const {validateInputJSONSchema, validateInputKeys} = require('./models/geomartvalidation');
const {updateJobStatus} = require('./models/geomartpostgres');

let samplePayload, result;

var resMessage = {
  code: '',
  status: '',
  message: ''
};

// mandatory fields
const requiredInputSchema = {
  reportType: '',
  versionID: [],
  eventID: 0,
  eventName: '',
  fileID: ''
};

describe('Request Payload', () => {
  it('validateInputJSONSchema should be defined', () => {
    expect(validateInputJSONSchema).toBeDefined();
  });

  it('validateInputKeys should be defined', () => {
    expect(validateInputKeys).toBeDefined();
  });

  describe('validateInputKeys', () => {
    it('case 1 - When there is any keys missing from input, should respond with error code and status Failed', async () => {
      // Missing keys
      samplePayload = {
        versionID: [1749, 749],
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputKeys (samplePayload, requiredInputSchema, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 2 - when input body has extra keys, it should validate with error code and status Failed', async () => {
      // Extra keys
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224',
        extraKey: 'extraField'
        };
      result = await validateInputKeys(samplePayload, requiredInputSchema, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });
});

  describe('validateInputJSONSchema', () => {
    it('case 1 - {} input paylod should validate with error code and status Failed', async () => {
      // {} request body
      samplePayload = {};
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 2 - incorrect reportType should validate with error code', async () => {
      // reportType not equal externalportalpackage
      samplePayload = {
        reportType: '',
        versionID: [1749, 749],
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224',
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 3 - If versionID is undefined in request structure,input should validate with error code', async () => {
      // undefined versionID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: undefined,
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 4 - If versionID list is not an array, input should validate with error code', async () => {
      // wrong type of versionID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: '',
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 5 - If VersionID array length is 0, input should validate with error code', async () => {
      // versionID Array length should not be 0
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [],
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 6 - If versionID Array element should not be a number,input should validate with error code', async () => {
      // versionID Array element not a number
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, '749'],
        eventID: 32,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 7 - If eventID is undefined in reuqest payload, input should validate with error code', async () => {
      // undefined eventID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: undefined,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 8 - If eventID is null in request payload, input should validate with error code', async () => {
      // null eventID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: null,
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 9 - If eventID should not be a number,input should validate with error code', async () => {
      // Not number eventID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: '32',
        eventName: 'test',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 10 - If eventName is empty,input should validate with error code', async () => {
      // eventName is empty
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: 32,
        eventName: '',
        fileID: '08092020-1224'
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 11 - If fileID is undefined in request payload,input should validate with error code', async () => {
      //undefined fileID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: 32,
        eventName: 'test',
        fileID: undefined,
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });

    it('case 12 - If fileID lenght should 13,input should validate with error code', async () => {
      //undefined fileID
      samplePayload = {
        reportType: 'externalportalpackage',
        versionID: [1749, 749],
        eventID: 32,
        eventName: 'test',
        fileID: '0909_0503',
      };
      result = await validateInputJSONSchema(samplePayload, resMessage);
      expect(result).toHaveProperty('status', 'Failed');
      expect(result).toHaveProperty('code', 'e003');
    });
  });
});
// end describe Request payload

describe('SQS Queue', () => {
  it('sendSqsMessage should be defined', () => {
    expect(sendSqsMessage).toBeDefined();
  });
}); // end _fn_SendSQSMessage

describe('sortArrayList', () => {
  it('sortArrayList should be defined', () => {
    expect(sortArrayList).toBeDefined();
  });
}); // end sortArrayList

describe('updateJobStatus', () => {
  it('updateJobStatus should be defined', () => {
    expect(updateJobStatus).toBeDefined();
  });
}); // end updateJobStatus
