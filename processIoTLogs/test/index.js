//  Unit Test
/* global describe:true, it:true, beforeEach:true, afterEach:true */
/* eslint-disable camelcase,import/no-extraneous-dependencies */
process.env.AWS_LAMBDA_FUNCTION_NAME = 'unittest';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const moduleTested = require('../index');  //  Module to be tested, i.e. the parent module.

const moduleName = 'processIoTLogs'; // eslint-disable-next-line no-unused-vars
const should = chai.should();
chai.use(chaiAsPromised);
let req = {};

/* eslint-disable quotes */
const testLog = require('./cloudwatch.json');
const testLine = '2017-12-06 16:05:20.742 TRACEID:b7e75c76-4c27-b1b8-9d08-44ebeeb6a991 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO]  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09a101602c9303d7/begin MESSAGE:PublishIn Status: SUCCESS';
/* eslint-enable quotes */

function startDebug() {
  //  Stub for setting breakpoints on exception.
}

describe(moduleName, () => {
  //  Test every exposed function in the module.

  beforeEach(() => {
    //  Erase the request object before every test.
    startDebug();
    req = { unittest: true };
  });

  // eslint-disable-next-line arrow-body-style
  afterEach(() => {
    // return moduleTested.flushLog(req);
  });

  it('should parse line', () => {
    // return moduleTested.task(req, device, body0, msg)
    const result = testLog.logEvents.map((event) => {
      const line = event.message;
      const res = moduleTested.parseLine(req, line);
      console.log({ res });
      return res;
    });
    return Promise.resolve(result);
  });
});
