//  Unit Test
/* global describe:true, it:true, beforeEach:true, afterEach:true */
/* eslint-disable max-len, import/no-extraneous-dependencies, no-console, no-unused-vars, one-var, no-underscore-dangle */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const uuidv4 = require('uuid/v4');

const moduleTested = require('../index');  //  Module to be tested, i.e. the parent module.

const moduleName = 'sigfox-aws';
const should = chai.should();
chai.use(chaiAsPromised);
let req = {};

/* eslint-disable quotes */
const testDevice1 = 'UNITTEST1';

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
  tmp: 36.9,
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

  afterEach(() => {
    return moduleTested.flushLog(req);
  });

  it('should log', () => {
    const msg = getTestMessage('number', testDevice1);
    moduleTested.log(req, 'action123/subAction456', { result: 'OK', number: 789, obj: { level1: { level2: {} } }, msg });
    return Promise.resolve('OK');
  });

  it('should log errors', () => {
    const msg = getTestMessage('number', testDevice1);
    moduleTested.log(req, 'action123/subAction456', { error: new Error('This is the error message'), number: 789, obj: { level1: { level2: {} } }, msg });
    return Promise.resolve('OK');
  });

  it('should publish message', () => {
    const msg = getTestMessage('number', testDevice1);
    const type = 'testtype';
    return moduleTested.publishMessage(req, msg, null, type);
  });
});
