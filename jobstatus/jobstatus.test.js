/**
 * Summary: Unit test class.
 * Description: Executes the unit test to validate input job request. Code coverage is only for validating input. 
 */

 // Import request validation modules
 const { validateInputJSONSchema } = require('./models/geomartvalidation');
 const { validateInputKeys } = require('./models/geomartvalidation');
 
    // Required fields in input request
    const requiredKeys = {
      jobID: ''
  };

  // Accepted fields in input request
  const allAcceptedKeys = {
      jobID: ''
  };

  // Response message
  let resMessage = {
      code: '',
      status: '',
      message: '',
      jobID:'',
      jobStatus:'',
      downloadLink: ''
  };
 
 // Unit test for validating required fields
 describe('Validation for required/extra field in input request', () => {
     test('validateInputKeys should be defined', () => {
         expect(validateInputKeys).toBeDefined();
     });
 
     it('API should fail the empty request.', async () => {
         let inputRequest = {};
         await validateInputKeys(inputRequest, requiredKeys, allAcceptedKeys, resMessage);
         expect(resMessage.status).toEqual('Failed');
     });
 
     it('API should fail the request where extra field is present in input request.', async () => {
         let inputRequest = {
             'jobID': 122,
             'eventName': ''
         };
         await validateInputKeys(inputRequest, requiredKeys, allAcceptedKeys, resMessage);
         expect(resMessage.status).toEqual('Failed');
     });
 });
 
 // Unit test for validating field values
 describe('Validation for field values in input request', () => {
     test('validateInputJSONSchema should be defined', () => {
         expect(validateInputJSONSchema).toBeDefined();
     });
 
     it('API should fail the empty request.', async () => {
         let inputRequest = {};
         await validateInputJSONSchema(inputRequest, resMessage);
         expect(resMessage.status).toEqual('Failed');
     });
 
     it('API should fail the request where jobID is null or empty.', async () => {
         let inputRequest = {
             'jobID': null
         };
         await validateInputJSONSchema(inputRequest, resMessage);
         expect(resMessage.status).toEqual('Failed');
     });
 
     it('API should fail the request where jobID format is not correct.', async () => {
         let inputRequest = {
             'jobID': '122'
         };
         await validateInputJSONSchema(inputRequest, resMessage);
         expect(resMessage.status).toEqual('Failed');
     });
 });