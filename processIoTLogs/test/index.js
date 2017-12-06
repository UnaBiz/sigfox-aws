//  Unit Test
/* global describe:true, it:true, beforeEach:true, afterEach:true */
/* eslint-disable camelcase */
process.env.AWS_LAMBDA_FUNCTION_NAME = 'unittest';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const moduleTested = require('../index');  //  Module to be tested, i.e. the parent module.

const moduleName = 'processIoTLogs';
const should = chai.should();
chai.use(chaiAsPromised);
let req = {};

/* eslint-disable quotes */
const testDevice1 = 'UNITTEST1';
const testLine = '2017-12-06 16:05:20.742 TRACEID:b7e75c76-4c27-b1b8-9d08-44ebeeb6a991 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO]  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09a101602c9303d7/begin MESSAGE:PublishIn Status: SUCCESS';
const testData = {  //  Structured msgs with numbers and text fields.
  number: '920e06272731741db051e600',
  text: '8013e569a0138c15c013f929',
};
const testBody = (timestamp, device, data) => ({
  deviceLat: 1.303224739957452,
  deviceLng: 103.86088826178306,
  data,
  ctr: 123,
  lig: 456,
  tmp: parseFloat(
    (36.0 + (Math.random() * 10.0)
    ).toFixed(1)),
  longPolling: false,
  device,
  ack: false,
  station: "0000",
  avgSnr: 15.54,
  timestamp: `${timestamp}`,
  seqNumber: 1492,
  lat: 1,
  callbackTimestamp: timestamp,
  lng: 104,
  duplicate: false,
  datetime: "2017-05-07 14:30:51",
  baseStationTime: parseInt(timestamp / 1000, 10),
  snr: 18.86,
  seqNumberCheck: null,
  rssi: -123,
  uuid: uuidv4(),
});
const testMessage = (timestamp, device, data) => ({
  history: [
    {
      duration: 0,
      end: timestamp,
      timestamp,
      function: "sigfoxCallback",
      latency: null,
    },
  ],
  query: {
    type: moduleName,
  },
  route: [],
  device,
  body: testBody(timestamp, device, data),
  type: moduleName,
});
/* eslint-enable quotes */

function startDebug() {
  //  Stub for setting breakpoints on exception.
}

function getTestMessage(type, device) {
  //  Return a copy of the test message with timestamp updated.
  const timestamp = Date.now();
  return testMessage(timestamp, device, testData[type]);
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
    const result = moduleTested.parseLine(req, testLine);
    console.log({ result });
    return Promise.resolve(result);
  });
});
