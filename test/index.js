//  Unit Test
/* global describe:true, it:true, beforeEach:true */
/* eslint-disable import/no-extraneous-dependencies, no-console, no-unused-vars, one-var,
 no-underscore-dangle */
const fs = require('fs');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const common = require('sigfox-gcloud');
const knex = require('knex');
const uuidv4 = require('uuid/v4');

//  Copy google-credentials before starting.
const creds = fs.readFileSync('./google-credentials.bak');
fs.writeFileSync('./google-credentials.json', creds);
const moduleTested = require('../index');  //  Module to be tested, i.e. the parent module.

const moduleName = 'sendToDatabase';
const should = chai.should();
chai.use(chaiAsPromised);
let req = {};
let testMetadata = null;
let testDatabaseConfig = null;
let testDB = null;

/* eslint-disable quotes, max-len */
const testInstance = null;  //  Simulates sendToDatabase
// const testInstance = '2';  //  Simulates sendToDatabase2
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
/* eslint-enable quotes, max-len */

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

  it.skip('should set up google-credentials.json', () => {
    const creds0 = fs.readFileSync('./google-credentials.bak');
    fs.writeFileSync('./google-credentials.json', creds0);
    return Promise.resolve('OK');
  });

  it('should get config from metadata', () => {
    //  Get the config from Google Compute Metadata.
    const promise = moduleTested.getMetadataConfig(req,
      moduleTested.metadataPrefix,
      moduleTested.metadataKeys,
      testInstance)
      .then((result) => {
        common.log(req, 'unittest', { result });
        testMetadata = result;
        return result;
      })
      .catch((error) => {
        common.error(req, 'unittest', { error });
        throw error;
      })
    ;
    return Promise.all([
      promise,
    ]);
  });

  it('should get database config', () => {
    //  Get the database config from Google Compute Metadata.
    const promise = moduleTested.getDatabaseConfig(req, false, testInstance)
      .then((result) => {
        common.log(req, 'unittest', { result });
        testDatabaseConfig = result;
        testDB = knex(testDatabaseConfig);
        return result;
      })
      .catch((error) => {
        common.error(req, 'unittest', { error });
        throw error;
      })
    ;
    return Promise.all([
      promise,
    ]);
  });

  it.skip('should delete sensor table', () => {
    //  Delete the sensor table.
    const promise = testDB.schema.dropTableIfExists(testMetadata.table)
      .then((result) => {
        common.log(req, 'unittest', { result });
        return result;
      })
      .catch((error) => {
        common.error(req, 'unittest', { error });
        throw error;
      })
    ;
    return Promise.all([
      promise,
    ]);
  });

  it('should create sensor table', () => {
    //  Create the sensordata table.
    const promise = moduleTested.createTable(req)
      .then((result) => {
        common.log(req, 'unittest', { result });
        return result;
      })
      .catch((error) => {
        common.error(req, 'unittest', { error });
        throw error;
      })
    ;
    return Promise.all([
      promise,
    ]);
  });

  it('should record sensor data', () => {
    //  Create a new record in the sensordata table.
    const testDevice = testDevice1;
    const msg = getTestMessage('number', testDevice);
    const body = msg.body;
    common.log(req, 'unittest', { testDevice, body, msg });
    const promise = moduleTested.task(req, testDevice, body, msg)
      .then((result) => {
        common.log(req, 'unittest', { result });
        return result;
      })
      .catch((error) => {
        common.error(req, 'unittest', { error });
        throw error;
      })
    ;
    return Promise.all([
      promise,
    ]);
  });

  it('should delete google-credentials.json', () => {
    const creds0 = fs.readFileSync('./google-credentials.json');
    fs.writeFileSync('./google-credentials.bak', creds0);
    fs.unlink('./google-credentials.json');
    return Promise.resolve('OK');
  });
});
