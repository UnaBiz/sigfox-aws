//  Unit Test
/* global describe:true, it:true, beforeEach:true, afterEach:true */
/* eslint-disable max-len, camelcase,import/no-extraneous-dependencies,import/newline-after-import, no-debugger */
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
// const testLine = '2017-12-06 16:05:20.742 TRACEID:b7e75c76-4c27-b1b8-9d08-44ebeeb6a991 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO]  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09a101602c9303d7/begin MESSAGE:PublishIn Status: SUCCESS';
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

  it.skip('should parse lines', () => {
    // return moduleTested.task(req, device, body0, msg)
    const result = testLog.logEvents.map((event) => {
      const line = event.message;
      const res = moduleTested.parseLine(req, line);
      console.log({ res });
      return res;
    });
    return Promise.resolve(result);
  });

  it.skip('should process lines', () => {
    // return moduleTested.task(req, device, body0, msg)
    const result = testLog.logEvents.map((event) => {
      const line = event.message;
      return moduleTested.processLine(req, line);
    });
    return Promise.all(result);
  });

  it.skip('should match trace', () => {
    const matches = []; // eslint-disable-next-line no-use-before-define
    const result = testLog2.split('\n').map(line =>
      moduleTested.processLine(req, line)
        .then(res => moduleTested.matchTrace(req, res.trace))
        .then((res) => { matches.push(res); console.log({ result: res }); })
        .catch((error) => { console.error(error.message, error.stack); }));
    return Promise.all(result)
      .then(() => { console.log(matches); debugger; });
  });

  it('should run task', () => // eslint-disable-next-line no-use-before-define
    moduleTested.task(req, testLog2.split('\n')));
});

const testLog2 = `
2017-12-07 04:26:20.694 TRACEID:f7314224-cc36-b950-955b-4759e5e1ea64 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-024a01602f396c63/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:20.694 TRACEID:f7314224-cc36-b950-955b-4759e5e1ea64 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35036
2017-12-07 04:26:20.754 TRACEID:aed20327-a6d8-8b48-d101-dd0437f96cd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:20.754 TRACEID:aed20327-a6d8-8b48-d101-dd0437f96cd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35038
2017-12-07 04:26:20.773 TRACEID:647106fc-a633-c53c-ec05-a63eb017fd75 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-024a01602f396c63/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:20.773 TRACEID:647106fc-a633-c53c-ec05-a63eb017fd75 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35040
2017-12-07 04:26:20.791 TRACEID:aed20327-a6d8-8b48-d101-dd0437f96cd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:20.791 TRACEID:aed20327-a6d8-8b48-d101-dd0437f96cd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:20.825 TRACEID:aed20327-a6d8-8b48-d101-dd0437f96cd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:23.772 TRACEID:adf3cdaa-bb7a-eac3-206c-a0b04fa55e31 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-20c001602f397834/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:23.772 TRACEID:adf3cdaa-bb7a-eac3-206c-a0b04fa55e31 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58402
2017-12-07 04:26:23.813 TRACEID:a96d4368-d496-3b86-b178-6d792d91f9a3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:23.813 TRACEID:a96d4368-d496-3b86-b178-6d792d91f9a3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58404
2017-12-07 04:26:23.840 TRACEID:3c961897-5f5c-8b3b-e8ad-2c658a1934f6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-20c001602f397834/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:23.840 TRACEID:3c961897-5f5c-8b3b-e8ad-2c658a1934f6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58406
2017-12-07 04:26:23.846 TRACEID:a96d4368-d496-3b86-b178-6d792d91f9a3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:23.846 TRACEID:a96d4368-d496-3b86-b178-6d792d91f9a3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:23.891 TRACEID:a96d4368-d496-3b86-b178-6d792d91f9a3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:24.067 TRACEID:1b35c4a6-c316-6c43-c08f-d96b61d677cf PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-065d01602f397963/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.067 TRACEID:1b35c4a6-c316-6c43-c08f-d96b61d677cf PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40410
2017-12-07 04:26:24.120 TRACEID:2b89fd60-bfd7-9bca-96a3-e854b55b7d57 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/aggregateSensorData MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.120 TRACEID:2b89fd60-bfd7-9bca-96a3-e854b55b7d57 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40412
2017-12-07 04:26:24.149 TRACEID:2b89fd60-bfd7-9bca-96a3-e854b55b7d57 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Matching rule found: sigfoxAggregateSensorData
2017-12-07 04:26:24.150 TRACEID:2b89fd60-bfd7-9bca-96a3-e854b55b7d57 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/aggregateSensorData
2017-12-07 04:26:24.185 TRACEID:f59be600-ddfb-4daf-ff71-4ebafc206e02 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-065d01602f397963/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.185 TRACEID:f59be600-ddfb-4daf-ff71-4ebafc206e02 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40414
2017-12-07 04:26:24.253 TRACEID:2b89fd60-bfd7-9bca-96a3-e854b55b7d57 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/aggregateSensorData, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:aggregateSensorData StatusCode: 202, Function error: null
2017-12-07 04:26:24.405 TRACEID:08e2ab01-202c-562d-bcad-fc2a0a5ec469 PRINCIPALID:SigfoxAggregator [INFO] EVENT:GetThingShadow THINGNAME:SigfoxAggregator
2017-12-07 04:26:24.425 TRACEID:147a6d83-be3e-b379-5aa7-6af44882c3dc PRINCIPALID:SigfoxAggregator [INFO] EVENT:UpdateThingShadow THINGNAME:SigfoxAggregator
2017-12-07 04:26:24.467 TRACEID:03a80ec1-e615-3693-5b0d-975ff19865c7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-03b901602f397b39/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.467 TRACEID:03a80ec1-e615-3693-5b0d-975ff19865c7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49838
2017-12-07 04:26:24.501 TRACEID:a6f3ef10-d029-43ca-eb5c-9d7efe4e9327 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.501 TRACEID:a6f3ef10-d029-43ca-eb5c-9d7efe4e9327 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49840
2017-12-07 04:26:24.522 TRACEID:28833a33-2a37-7c21-b9fa-16082557ac51 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-03b901602f397b39/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:24.522 TRACEID:28833a33-2a37-7c21-b9fa-16082557ac51 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49842
2017-12-07 04:26:24.536 TRACEID:a6f3ef10-d029-43ca-eb5c-9d7efe4e9327 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToUbidots
2017-12-07 04:26:24.536 TRACEID:a6f3ef10-d029-43ca-eb5c-9d7efe4e9327 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToUbidots
2017-12-07 04:26:24.564 TRACEID:a6f3ef10-d029-43ca-eb5c-9d7efe4e9327 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToUbidots, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToUbidots2 StatusCode: 202, Function error: null
2017-12-07 04:26:24.773 TRACEID:73bbb136-b02d-c39e-fba8-549f7870f24c PRINCIPALID:2C30EB [INFO] EVENT:GetThingShadow THINGNAME:2C30EB
2017-12-07 04:26:26.667 TRACEID:565fab0c-4939-78c7-71fe-42fa49d02691 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-064801602f3983af/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:26.667 TRACEID:565fab0c-4939-78c7-71fe-42fa49d02691 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35108
2017-12-07 04:26:26.704 TRACEID:fbd188a3-1c00-2dd6-5935-92792e321f29 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:26.704 TRACEID:fbd188a3-1c00-2dd6-5935-92792e321f29 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35110
2017-12-07 04:26:26.722 TRACEID:31fd867f-bcfd-072f-6803-8861ce547cfa PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-064801602f3983af/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:26.722 TRACEID:31fd867f-bcfd-072f-6803-8861ce547cfa PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35112
2017-12-07 04:26:26.747 TRACEID:fbd188a3-1c00-2dd6-5935-92792e321f29 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:26.747 TRACEID:fbd188a3-1c00-2dd6-5935-92792e321f29 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:26.796 TRACEID:fbd188a3-1c00-2dd6-5935-92792e321f29 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:26.934 TRACEID:9599f7ac-3bbb-d833-5f95-a9d4a13e6af2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-018001602f3984b3/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:26.934 TRACEID:9599f7ac-3bbb-d833-5f95-a9d4a13e6af2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58474
2017-12-07 04:26:26.983 TRACEID:5597a9a2-f4c5-deef-7bfc-1190b93de171 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:26.983 TRACEID:5597a9a2-f4c5-deef-7bfc-1190b93de171 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58476
2017-12-07 04:26:27.003 TRACEID:62a7bcdc-b217-2fde-39cf-b5d3281d477e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-018001602f3984b3/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.003 TRACEID:62a7bcdc-b217-2fde-39cf-b5d3281d477e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58478
2017-12-07 04:26:27.011 TRACEID:5597a9a2-f4c5-deef-7bfc-1190b93de171 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:27.011 TRACEID:5597a9a2-f4c5-deef-7bfc-1190b93de171 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:27.044 TRACEID:5597a9a2-f4c5-deef-7bfc-1190b93de171 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:27.210 TRACEID:e71e69b1-b81a-500d-c71f-6966486e5a37 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-1d0901602f3985ac/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.210 TRACEID:e71e69b1-b81a-500d-c71f-6966486e5a37 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40432
2017-12-07 04:26:27.255 TRACEID:d3b8ac28-116b-03b8-d219-208a4677b42b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/aggregateSensorData MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.255 TRACEID:d3b8ac28-116b-03b8-d219-208a4677b42b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40434
2017-12-07 04:26:27.270 TRACEID:0ea94e19-fd5d-04ee-897e-e7459568d0b1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-1d0901602f3985ac/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.270 TRACEID:0ea94e19-fd5d-04ee-897e-e7459568d0b1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40436
2017-12-07 04:26:27.283 TRACEID:d3b8ac28-116b-03b8-d219-208a4677b42b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Matching rule found: sigfoxAggregateSensorData
2017-12-07 04:26:27.284 TRACEID:d3b8ac28-116b-03b8-d219-208a4677b42b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/aggregateSensorData
2017-12-07 04:26:27.354 TRACEID:d3b8ac28-116b-03b8-d219-208a4677b42b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/aggregateSensorData, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:aggregateSensorData StatusCode: 202, Function error: null
2017-12-07 04:26:27.498 TRACEID:f1566e40-8e93-6e59-3ee7-8c5bdc4c077c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-1e6001602f3986e4/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.498 TRACEID:f1566e40-8e93-6e59-3ee7-8c5bdc4c077c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49904
2017-12-07 04:26:27.537 TRACEID:df78704d-322a-8c59-c11f-3f0eac45b821 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.537 TRACEID:df78704d-322a-8c59-c11f-3f0eac45b821 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49906
2017-12-07 04:26:27.557 TRACEID:64013524-efb8-5e79-a3d1-c97df510e71b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-1e6001602f3986e4/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:27.557 TRACEID:64013524-efb8-5e79-a3d1-c97df510e71b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49908
2017-12-07 04:26:27.567 TRACEID:df78704d-322a-8c59-c11f-3f0eac45b821 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToUbidots
2017-12-07 04:26:27.568 TRACEID:df78704d-322a-8c59-c11f-3f0eac45b821 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToUbidots
2017-12-07 04:26:27.637 TRACEID:df78704d-322a-8c59-c11f-3f0eac45b821 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToUbidots, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToUbidots2 StatusCode: 202, Function error: null
2017-12-07 04:26:27.875 TRACEID:80296496-d511-5d05-d45b-de770451807a PRINCIPALID:21DFE9 [INFO] EVENT:GetThingShadow THINGNAME:21DFE9
2017-12-07 04:26:28.058 TRACEID:df884b18-5c31-2885-ed45-f5e04e3194f9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-08c601602f398926/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.058 TRACEID:df884b18-5c31-2885-ed45-f5e04e3194f9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43156
2017-12-07 04:26:28.101 TRACEID:9a088c13-8c8c-9ad9-4c2c-8c27a35525af PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToDatabase MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.101 TRACEID:9a088c13-8c8c-9ad9-4c2c-8c27a35525af PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43158
2017-12-07 04:26:28.122 TRACEID:8b58a2ee-9855-90cd-d8e3-b357b20a7a30 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-08c601602f398926/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.122 TRACEID:8b58a2ee-9855-90cd-d8e3-b357b20a7a30 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43160
2017-12-07 04:26:28.129 TRACEID:9a088c13-8c8c-9ad9-4c2c-8c27a35525af PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToDatabase
2017-12-07 04:26:28.130 TRACEID:9a088c13-8c8c-9ad9-4c2c-8c27a35525af PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToDatabase
2017-12-07 04:26:28.161 TRACEID:9a088c13-8c8c-9ad9-4c2c-8c27a35525af PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToDatabase, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToDatabase2 StatusCode: 202, Function error: null
2017-12-07 04:26:28.472 TRACEID:dc14b377-12e9-9257-3381-0c0eb4013082 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1e9501602f398acb/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.472 TRACEID:dc14b377-12e9-9257-3381-0c0eb4013082 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52950
2017-12-07 04:26:28.510 TRACEID:78a8c1e9-84fe-6880-bb9f-21a4e266297a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/devices/2C30EB MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.510 TRACEID:78a8c1e9-84fe-6880-bb9f-21a4e266297a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52952
2017-12-07 04:26:28.539 TRACEID:098af54a-eaff-9e21-15ea-3bcc2898c913 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1e9501602f398acb/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:28.539 TRACEID:098af54a-eaff-9e21-15ea-3bcc2898c913 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52954
2017-12-07 04:26:28.540 TRACEID:78a8c1e9-84fe-6880-bb9f-21a4e266297a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Matching rule found: 2C30EB_chk_temp
2017-12-07 04:26:28.541 TRACEID:78a8c1e9-84fe-6880-bb9f-21a4e266297a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [DEBUG] EVENT:SNSActionStart TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Starting execution of SNSAction on topic sigfox/devices/2C30EB
2017-12-07 04:26:28.592 TRACEID:e955765b-150e-bcaa-3b19-0996eb8059db PRINCIPALID:2C30EB [INFO] EVENT:UpdateThingShadow THINGNAME:2C30EB
2017-12-07 04:26:28.592 TRACEID:e955765b-150e-bcaa-3b19-0996eb8059db PRINCIPALID:2C30EB [ERROR] EVENT:UpdateThingShadow THINGNAME:2C30EB ERRORCODE:400 MESSAGE:Json contains too many levels of nesting. Maximum allowed is 6.
2017-12-07 04:26:28.607 TRACEID:78a8c1e9-84fe-6880-bb9f-21a4e266297a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:SNSActionSuccess TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Successfully published to SNS topic. Message arrived on: sigfox/devices/2C30EB, Action: sns, Target Arn: arn:aws:sns:ap-southeast-1:595779189490:2C30EB_notify SNS Message Id: 8d9112fb-9314-5467-b2e4-4059562023c9
2017-12-07 04:26:29.099 TRACEID:a58173e9-a506-0b12-f150-67e2316261b5 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-17fe01602f398d4f/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.099 TRACEID:a58173e9-a506-0b12-f150-67e2316261b5 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43118
2017-12-07 04:26:29.140 TRACEID:bf936111-c059-d42f-3359-e6dfc5ae44c9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToDatabase MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.140 TRACEID:bf936111-c059-d42f-3359-e6dfc5ae44c9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43120
2017-12-07 04:26:29.165 TRACEID:f81599ac-cd70-54fe-6634-f3c8e7d58977 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-17fe01602f398d4f/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.165 TRACEID:f81599ac-cd70-54fe-6634-f3c8e7d58977 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43122
2017-12-07 04:26:29.168 TRACEID:bf936111-c059-d42f-3359-e6dfc5ae44c9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToDatabase
2017-12-07 04:26:29.169 TRACEID:bf936111-c059-d42f-3359-e6dfc5ae44c9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToDatabase
2017-12-07 04:26:29.202 TRACEID:bf936111-c059-d42f-3359-e6dfc5ae44c9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToDatabase, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToDatabase2 StatusCode: 202, Function error: null
2017-12-07 04:26:29.509 TRACEID:66b38604-76f2-dde1-320b-55e70fd6905a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-035101602f398eca/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.509 TRACEID:66b38604-76f2-dde1-320b-55e70fd6905a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52976
2017-12-07 04:26:29.528 TRACEID:48265247-9bbf-ffbc-e6c8-8113fa867304 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/devices/21DFE9 MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.528 TRACEID:48265247-9bbf-ffbc-e6c8-8113fa867304 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52978
2017-12-07 04:26:29.550 TRACEID:3ddd768f-5c5f-2f80-48f5-36ecd2098ed1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/21DFE9-035101602f398eca/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:29.550 TRACEID:3ddd768f-5c5f-2f80-48f5-36ecd2098ed1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 52980
2017-12-07 04:26:29.606 TRACEID:45bada8b-a9b8-4983-dcb1-3b67e371bbab PRINCIPALID:21DFE9 [INFO] EVENT:UpdateThingShadow THINGNAME:21DFE9
2017-12-07 04:26:29.606 TRACEID:45bada8b-a9b8-4983-dcb1-3b67e371bbab PRINCIPALID:21DFE9 [ERROR] EVENT:UpdateThingShadow THINGNAME:21DFE9 ERRORCODE:400 MESSAGE:Json contains too many levels of nesting. Maximum allowed is 6.
2017-12-07 04:26:35.327 TRACEID:e59bda78-9948-a670-bc56-7f0d4b8f305d PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1b6a01602f39a56e/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.327 TRACEID:e59bda78-9948-a670-bc56-7f0d4b8f305d PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35176
2017-12-07 04:26:35.365 TRACEID:0f481d6d-43a5-c4f4-104d-91380e92c88b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.365 TRACEID:0f481d6d-43a5-c4f4-104d-91380e92c88b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35178
2017-12-07 04:26:35.389 TRACEID:e157fdf0-9e7b-f4ec-aca1-98fee38d100e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1b6a01602f39a56e/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.389 TRACEID:e157fdf0-9e7b-f4ec-aca1-98fee38d100e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35180
2017-12-07 04:26:35.399 TRACEID:0f481d6d-43a5-c4f4-104d-91380e92c88b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:35.400 TRACEID:0f481d6d-43a5-c4f4-104d-91380e92c88b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:35.440 TRACEID:0f481d6d-43a5-c4f4-104d-91380e92c88b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:35.618 TRACEID:4415a6ea-2903-2604-1d23-0461e8c69b15 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-161701602f39a689/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.618 TRACEID:4415a6ea-2903-2604-1d23-0461e8c69b15 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58542
2017-12-07 04:26:35.669 TRACEID:1c3eddb9-1261-0f45-521d-77d95be06b7f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.669 TRACEID:1c3eddb9-1261-0f45-521d-77d95be06b7f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58548
2017-12-07 04:26:35.688 TRACEID:66dde3a9-6b06-ef08-07dd-22d99a9b80b6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-161701602f39a689/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.688 TRACEID:66dde3a9-6b06-ef08-07dd-22d99a9b80b6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58550
2017-12-07 04:26:35.702 TRACEID:1c3eddb9-1261-0f45-521d-77d95be06b7f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:35.702 TRACEID:1c3eddb9-1261-0f45-521d-77d95be06b7f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:35.745 TRACEID:1c3eddb9-1261-0f45-521d-77d95be06b7f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:35.929 TRACEID:66878eb2-7438-d635-7ab1-1f7c65d0e20a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-075b01602f39a7cb/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.929 TRACEID:66878eb2-7438-d635-7ab1-1f7c65d0e20a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40454
2017-12-07 04:26:35.973 TRACEID:6a888909-1063-7619-4122-3b0403a5d634 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/aggregateSensorData MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.973 TRACEID:6a888909-1063-7619-4122-3b0403a5d634 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40456
2017-12-07 04:26:35.994 TRACEID:83465d6d-50c8-d782-3575-0102d1465c4c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-075b01602f39a7cb/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:35.994 TRACEID:83465d6d-50c8-d782-3575-0102d1465c4c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40458
2017-12-07 04:26:35.999 TRACEID:6a888909-1063-7619-4122-3b0403a5d634 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Matching rule found: sigfoxAggregateSensorData
2017-12-07 04:26:36.000 TRACEID:6a888909-1063-7619-4122-3b0403a5d634 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/aggregateSensorData
2017-12-07 04:26:36.031 TRACEID:6a888909-1063-7619-4122-3b0403a5d634 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/aggregateSensorData, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:aggregateSensorData StatusCode: 202, Function error: null
2017-12-07 04:26:36.255 TRACEID:8186e99b-927e-61af-1ad3-371f4e697fbc PRINCIPALID:SigfoxAggregator [INFO] EVENT:GetThingShadow THINGNAME:SigfoxAggregator
2017-12-07 04:26:36.276 TRACEID:ea860d2b-79aa-082a-dfc6-5bed64b0477d PRINCIPALID:SigfoxAggregator [INFO] EVENT:UpdateThingShadow THINGNAME:SigfoxAggregator
2017-12-07 04:26:36.340 TRACEID:488c932a-b3ab-17c2-f2c4-b8d7bb08d134 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-090701602f39a983/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:36.340 TRACEID:488c932a-b3ab-17c2-f2c4-b8d7bb08d134 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49982
2017-12-07 04:26:36.368 TRACEID:fb1d8e16-17cb-b87e-d3bf-feb027b7f2d3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:36.368 TRACEID:fb1d8e16-17cb-b87e-d3bf-feb027b7f2d3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49984
2017-12-07 04:26:36.388 TRACEID:fb8fdd8b-63e5-de28-54a5-323f9db87fa0 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-090701602f39a983/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:36.388 TRACEID:fb8fdd8b-63e5-de28-54a5-323f9db87fa0 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 49986
2017-12-07 04:26:36.397 TRACEID:fb1d8e16-17cb-b87e-d3bf-feb027b7f2d3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToUbidots
2017-12-07 04:26:36.397 TRACEID:fb1d8e16-17cb-b87e-d3bf-feb027b7f2d3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToUbidots
2017-12-07 04:26:36.439 TRACEID:fb1d8e16-17cb-b87e-d3bf-feb027b7f2d3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToUbidots, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToUbidots2 StatusCode: 202, Function error: null
2017-12-07 04:26:36.615 TRACEID:ffbd7e32-18ab-4ba3-bec1-9b26a4b2d17e PRINCIPALID:2C30EB [INFO] EVENT:GetThingShadow THINGNAME:2C30EB
2017-12-07 04:26:39.058 TRACEID:752f5691-8192-545b-8a61-5b8f43d9b21e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-258301602f39b3fb/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.058 TRACEID:752f5691-8192-545b-8a61-5b8f43d9b21e PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43146
2017-12-07 04:26:39.088 TRACEID:8436a158-6f4f-f278-fc3e-d13b2a4116d2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToDatabase MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.088 TRACEID:8436a158-6f4f-f278-fc3e-d13b2a4116d2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43148
2017-12-07 04:26:39.116 TRACEID:8436a158-6f4f-f278-fc3e-d13b2a4116d2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToDatabase
2017-12-07 04:26:39.116 TRACEID:8436a158-6f4f-f278-fc3e-d13b2a4116d2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToDatabase
2017-12-07 04:26:39.116 TRACEID:ad0448f1-a35f-afb3-04c0-77484cb54348 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-258301602f39b3fb/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.116 TRACEID:ad0448f1-a35f-afb3-04c0-77484cb54348 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43150
2017-12-07 04:26:39.194 TRACEID:8436a158-6f4f-f278-fc3e-d13b2a4116d2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToDatabase, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToDatabase2 StatusCode: 202, Function error: null
2017-12-07 04:26:39.693 TRACEID:22575728-4c1f-11f5-946d-ef2f638b10f7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1f2d01602f39b627/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.693 TRACEID:22575728-4c1f-11f5-946d-ef2f638b10f7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53006
2017-12-07 04:26:39.723 TRACEID:f9e809ba-301c-195c-1e67-3b2512609544 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/devices/2C30EB MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.723 TRACEID:f9e809ba-301c-195c-1e67-3b2512609544 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53008
2017-12-07 04:26:39.741 TRACEID:9c7c92fc-6e8e-ae62-10ab-d981ef929a06 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1f2d01602f39b627/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:39.741 TRACEID:9c7c92fc-6e8e-ae62-10ab-d981ef929a06 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53010
2017-12-07 04:26:39.765 TRACEID:f9e809ba-301c-195c-1e67-3b2512609544 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Matching rule found: 2C30EB_chk_temp
2017-12-07 04:26:39.765 TRACEID:f9e809ba-301c-195c-1e67-3b2512609544 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [DEBUG] EVENT:SNSActionStart TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Starting execution of SNSAction on topic sigfox/devices/2C30EB
2017-12-07 04:26:39.810 TRACEID:9594fcc3-0fa9-6064-7cf1-308ffd348fa1 PRINCIPALID:2C30EB [INFO] EVENT:UpdateThingShadow THINGNAME:2C30EB
2017-12-07 04:26:39.811 TRACEID:9594fcc3-0fa9-6064-7cf1-308ffd348fa1 PRINCIPALID:2C30EB [ERROR] EVENT:UpdateThingShadow THINGNAME:2C30EB ERRORCODE:400 MESSAGE:Json contains too many levels of nesting. Maximum allowed is 6.
2017-12-07 04:26:39.832 TRACEID:f9e809ba-301c-195c-1e67-3b2512609544 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:SNSActionSuccess TOPICNAME:sigfox/devices/2C30EB CLIENTID:N/A MESSAGE:Successfully published to SNS topic. Message arrived on: sigfox/devices/2C30EB, Action: sns, Target Arn: arn:aws:sns:ap-southeast-1:595779189490:2C30EB_notify SNS Message Id: ee6096b4-87e7-58cb-84a0-c41642d8a166
2017-12-07 04:26:41.274 TRACEID:fc8d7329-15a9-f55f-6dce-39b943779559 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-1ed901602f39bcb5/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.274 TRACEID:fc8d7329-15a9-f55f-6dce-39b943779559 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35256
2017-12-07 04:26:41.309 TRACEID:33e7699b-085b-8507-a358-96915afdfa08 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.309 TRACEID:33e7699b-085b-8507-a358-96915afdfa08 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35258
2017-12-07 04:26:41.326 TRACEID:c5658434-2962-ab49-a555-7ebe571704cb PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-1ed901602f39bcb5/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.326 TRACEID:c5658434-2962-ab49-a555-7ebe571704cb PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 35260
2017-12-07 04:26:41.346 TRACEID:33e7699b-085b-8507-a358-96915afdfa08 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:41.346 TRACEID:33e7699b-085b-8507-a358-96915afdfa08 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:41.386 TRACEID:33e7699b-085b-8507-a358-96915afdfa08 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:41.552 TRACEID:9c792856-0d72-be5a-85cc-0f5cb1e98a81 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-146a01602f39bda5/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.552 TRACEID:9c792856-0d72-be5a-85cc-0f5cb1e98a81 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58622
2017-12-07 04:26:41.709 TRACEID:167c81dd-c0f6-21ba-9bb0-a14b91a08434 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.709 TRACEID:167c81dd-c0f6-21ba-9bb0-a14b91a08434 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58624
2017-12-07 04:26:41.734 TRACEID:33343716-c277-7153-3481-f7c36af56189 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-146a01602f39bda5/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.734 TRACEID:33343716-c277-7153-3481-f7c36af56189 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58626
2017-12-07 04:26:41.735 TRACEID:167c81dd-c0f6-21ba-9bb0-a14b91a08434 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:41.736 TRACEID:167c81dd-c0f6-21ba-9bb0-a14b91a08434 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:41.817 TRACEID:167c81dd-c0f6-21ba-9bb0-a14b91a08434 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:41.993 TRACEID:5cc91c24-2975-1eb6-3079-6f214691d01a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-0cff01602f39bf61/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:41.993 TRACEID:5cc91c24-2975-1eb6-3079-6f214691d01a PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40484
2017-12-07 04:26:42.024 TRACEID:46c53f37-e914-dd93-78cf-22e51254ace2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/aggregateSensorData MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.024 TRACEID:46c53f37-e914-dd93-78cf-22e51254ace2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40486
2017-12-07 04:26:42.061 TRACEID:f5d77a97-a4f8-90cc-9363-f1cf3dc2eb2c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-0cff01602f39bf61/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.061 TRACEID:f5d77a97-a4f8-90cc-9363-f1cf3dc2eb2c PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40488
2017-12-07 04:26:42.063 TRACEID:46c53f37-e914-dd93-78cf-22e51254ace2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Matching rule found: sigfoxAggregateSensorData
2017-12-07 04:26:42.063 TRACEID:46c53f37-e914-dd93-78cf-22e51254ace2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/aggregateSensorData
2017-12-07 04:26:42.106 TRACEID:46c53f37-e914-dd93-78cf-22e51254ace2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/aggregateSensorData, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:aggregateSensorData StatusCode: 202, Function error: null
2017-12-07 04:26:42.277 TRACEID:d6ab7fd5-f337-cf10-046a-67228f3a12e1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-130701602f39c08c/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.277 TRACEID:d6ab7fd5-f337-cf10-046a-67228f3a12e1 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50052
2017-12-07 04:26:42.304 TRACEID:af079d77-75ec-40cd-be92-937c1a4798e3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.304 TRACEID:af079d77-75ec-40cd-be92-937c1a4798e3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50054
2017-12-07 04:26:42.324 TRACEID:a56eeeee-3da8-9b03-0183-ddc6019d93d7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-130701602f39c08c/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.324 TRACEID:a56eeeee-3da8-9b03-0183-ddc6019d93d7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50056
2017-12-07 04:26:42.338 TRACEID:af079d77-75ec-40cd-be92-937c1a4798e3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToUbidots
2017-12-07 04:26:42.339 TRACEID:af079d77-75ec-40cd-be92-937c1a4798e3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToUbidots
2017-12-07 04:26:42.381 TRACEID:af079d77-75ec-40cd-be92-937c1a4798e3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToUbidots CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToUbidots, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToUbidots2 StatusCode: 202, Function error: null
2017-12-07 04:26:42.553 TRACEID:c8e2ad1d-8511-e3fd-430e-a5afdbb316a4 PRINCIPALID:4D9757 [INFO] EVENT:GetThingShadow THINGNAME:4D9757
2017-12-07 04:26:42.651 TRACEID:44deb2f4-8c7d-7de9-c154-f5c33a74cbd3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-145101602f39c205/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.651 TRACEID:44deb2f4-8c7d-7de9-c154-f5c33a74cbd3 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43184
2017-12-07 04:26:42.680 TRACEID:e2ab32dc-75a8-908f-67fd-3fa5123766ff PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToDatabase MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.680 TRACEID:e2ab32dc-75a8-908f-67fd-3fa5123766ff PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43186
2017-12-07 04:26:42.705 TRACEID:14f5db86-77a9-f8cf-a0fd-ac9e90f38364 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-145101602f39c205/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:42.705 TRACEID:14f5db86-77a9-f8cf-a0fd-ac9e90f38364 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 43188
2017-12-07 04:26:42.708 TRACEID:e2ab32dc-75a8-908f-67fd-3fa5123766ff PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Matching rule found: sigfoxSendToDatabase
2017-12-07 04:26:42.709 TRACEID:e2ab32dc-75a8-908f-67fd-3fa5123766ff PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/sendToDatabase
2017-12-07 04:26:42.732 TRACEID:e2ab32dc-75a8-908f-67fd-3fa5123766ff PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToUbidots2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/sendToDatabase CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/sendToDatabase, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:sendToDatabase2 StatusCode: 202, Function error: null
2017-12-07 04:26:43.058 TRACEID:f8a1db86-6cdb-f943-c5a8-fcdd609f4d99 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-057c01602f39c3c6/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:43.058 TRACEID:f8a1db86-6cdb-f943-c5a8-fcdd609f4d99 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53034
2017-12-07 04:26:43.081 TRACEID:5fa5a171-aa14-5e15-30ae-d6c297fd2739 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/devices/4D9757 MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:43.081 TRACEID:5fa5a171-aa14-5e15-30ae-d6c297fd2739 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53036
2017-12-07 04:26:43.105 TRACEID:6ee9074e-4fbe-20a4-1158-941d11bbe452 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/4D9757-057c01602f39c3c6/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:43.105 TRACEID:6ee9074e-4fbe-20a4-1158-941d11bbe452 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sendToDatabase2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.99.46 SourcePort: 53038
2017-12-07 04:26:43.150 TRACEID:67e29bdb-cdaa-1a62-d96c-49f184ba0ac0 PRINCIPALID:4D9757 [INFO] EVENT:UpdateThingShadow THINGNAME:4D9757
2017-12-07 04:26:43.151 TRACEID:67e29bdb-cdaa-1a62-d96c-49f184ba0ac0 PRINCIPALID:4D9757 [ERROR] EVENT:UpdateThingShadow THINGNAME:4D9757 ERRORCODE:400 MESSAGE:Json contains too many levels of nesting. Maximum allowed is 6.
2017-12-07 04:26:51.155 TRACEID:e1970056-a3f9-3f1d-8ff5-8b935ac0b74b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1bce01602f39e2cd/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.155 TRACEID:e1970056-a3f9-3f1d-8ff5-8b935ac0b74b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42314
2017-12-07 04:26:51.183 TRACEID:da8b3728-8e55-fb94-912f-f6e63ba3ee92 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.183 TRACEID:da8b3728-8e55-fb94-912f-f6e63ba3ee92 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42316
2017-12-07 04:26:51.204 TRACEID:7ca9f070-681d-9664-b531-e17ff4be8bd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1bce01602f39e2cd/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.204 TRACEID:7ca9f070-681d-9664-b531-e17ff4be8bd7 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42318
2017-12-07 04:26:51.210 TRACEID:da8b3728-8e55-fb94-912f-f6e63ba3ee92 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:51.210 TRACEID:da8b3728-8e55-fb94-912f-f6e63ba3ee92 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:51.272 TRACEID:da8b3728-8e55-fb94-912f-f6e63ba3ee92 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:51.456 TRACEID:c1e73568-49a6-3a55-5018-423a1ede0ec0 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-062a01602f39e464/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.456 TRACEID:c1e73568-49a6-3a55-5018-423a1ede0ec0 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58670
2017-12-07 04:26:51.492 TRACEID:f8c59d0e-fe22-8c5c-e089-4d17f7e26e45 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.492 TRACEID:f8c59d0e-fe22-8c5c-e089-4d17f7e26e45 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58674
2017-12-07 04:26:51.508 TRACEID:490b8983-e4f5-d534-089d-951e592a5994 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-062a01602f39e464/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.508 TRACEID:490b8983-e4f5-d534-089d-951e592a5994 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58676
2017-12-07 04:26:51.540 TRACEID:f8c59d0e-fe22-8c5c-e089-4d17f7e26e45 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:51.540 TRACEID:f8c59d0e-fe22-8c5c-e089-4d17f7e26e45 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:51.574 TRACEID:f8c59d0e-fe22-8c5c-e089-4d17f7e26e45 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:51.727 TRACEID:77dc2306-3620-8bbf-5400-2f4ab71ba0f2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-140201602f39e581/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.727 TRACEID:77dc2306-3620-8bbf-5400-2f4ab71ba0f2 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40506
2017-12-07 04:26:51.759 TRACEID:44e3d56a-005c-469d-ca2c-136736a5ec7b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/aggregateSensorData MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.759 TRACEID:44e3d56a-005c-469d-ca2c-136736a5ec7b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40508
2017-12-07 04:26:51.784 TRACEID:3f4f5459-cf35-9f78-8241-f2c18f4bcfa6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-140201602f39e581/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.784 TRACEID:3f4f5459-cf35-9f78-8241-f2c18f4bcfa6 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40510
2017-12-07 04:26:51.787 TRACEID:44e3d56a-005c-469d-ca2c-136736a5ec7b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Matching rule found: sigfoxAggregateSensorData
2017-12-07 04:26:51.788 TRACEID:44e3d56a-005c-469d-ca2c-136736a5ec7b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/aggregateSensorData
2017-12-07 04:26:51.831 TRACEID:44e3d56a-005c-469d-ca2c-136736a5ec7b PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/aggregateSensorData CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/aggregateSensorData, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:aggregateSensorData StatusCode: 202, Function error: null
2017-12-07 04:26:51.992 TRACEID:c172402e-e122-6cba-6015-1fa4db8d0a38 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-265201602f39e693/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:51.992 TRACEID:c172402e-e122-6cba-6015-1fa4db8d0a38 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50102
2017-12-07 04:26:52.028 TRACEID:5c747bf0-b06b-9c37-917e-52e1f1220052 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.028 TRACEID:5c747bf0-b06b-9c37-917e-52e1f1220052 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50104
2017-12-07 04:26:52.050 TRACEID:3454d9ce-0a0c-bc8d-db5b-87b6b67b8895 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-265201602f39e693/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.050 TRACEID:3454d9ce-0a0c-bc8d-db5b-87b6b67b8895 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:aggregateSensorData [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 50106
2017-12-07 04:26:52.326 TRACEID:a899b0c2-2f1d-e471-c6ec-a413f28fc222 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-23b001602f39e7f4/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.326 TRACEID:a899b0c2-2f1d-e471-c6ec-a413f28fc222 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42350
2017-12-07 04:26:52.334 TRACEID:2344d42a-d543-5b3c-caae-cfa7dc7b1a21 PRINCIPALID:2C30EB [INFO] EVENT:GetThingShadow THINGNAME:2C30EB
2017-12-07 04:26:52.387 TRACEID:3ff19520-c866-37c2-b5c6-e0f2c0278f4f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.387 TRACEID:3ff19520-c866-37c2-b5c6-e0f2c0278f4f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42354
2017-12-07 04:26:52.411 TRACEID:d8b4ad99-8de6-a587-3f64-f6e5da045d10 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-23b001602f39e7f4/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.411 TRACEID:d8b4ad99-8de6-a587-3f64-f6e5da045d10 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.254.176.79 SourcePort: 42356
2017-12-07 04:26:52.414 TRACEID:3ff19520-c866-37c2-b5c6-e0f2c0278f4f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-07 04:26:52.415 TRACEID:3ff19520-c866-37c2-b5c6-e0f2c0278f4f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-07 04:26:52.522 TRACEID:3ff19520-c866-37c2-b5c6-e0f2c0278f4f PRINCIPALID:AROAJU2EQQYDUODTL62CQ:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:routeMessage StatusCode: 202, Function error: null
2017-12-07 04:26:52.657 TRACEID:88c3dca4-4fa8-3c13-917c-4d80853ecaef PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-208601602f39e92b/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.657 TRACEID:88c3dca4-4fa8-3c13-917c-4d80853ecaef PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58716
2017-12-07 04:26:52.702 TRACEID:b9c61fe9-f169-68fb-b333-fb271bef50b9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.702 TRACEID:b9c61fe9-f169-68fb-b333-fb271bef50b9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58718
2017-12-07 04:26:52.721 TRACEID:b757a85d-da2b-e4a4-7a3b-d96c05ced842 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-208601602f39e92b/end MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:52.721 TRACEID:b757a85d-da2b-e4a4-7a3b-d96c05ced842 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 52.221.228.71 SourcePort: 58720
2017-12-07 04:26:52.736 TRACEID:b9c61fe9-f169-68fb-b333-fb271bef50b9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-07 04:26:52.736 TRACEID:b9c61fe9-f169-68fb-b333-fb271bef50b9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-07 04:26:52.789 TRACEID:b9c61fe9-f169-68fb-b333-fb271bef50b9 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:595779189490:function:decodeStructuredMessage2 StatusCode: 202, Function error: null
2017-12-07 04:26:53.025 TRACEID:553fc737-87f9-bdee-08e7-cb302835c482 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/2C30EB-1fca01602f39ea71/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-07 04:26:53.025 TRACEID:553fc737-87f9-bdee-08e7-cb302835c482 PRINCIPALID:AROAJU2EQQYDUODTL62CQ:decodeStructuredMessage2 [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 54.255.181.98 SourcePort: 40528
`;
