//  region Introduction
//  sigfox-aws is a framework for building a Sigfox server, based
//  on Amazon Web Services and AWS IoT.  This module contains the framework functions
//  used by sigfox-aws Lambda Functions.  They should also work with Linux, MacOS
//  and Ubuntu on Windows for unit testing.
/* eslint-disable max-len,import/no-unresolved,import/newline-after-import,arrow-body-style,camelcase,no-nested-ternary,no-underscore-dangle */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Declarations - Helper constants to detect if we are running on Google Cloud or AWS.
const isGoogleCloud = !!process.env.FUNCTION_NAME || !!process.env.GAE_SERVICE;
const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isProduction = (process.env.NODE_ENV === 'production');  //  True on production server.

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || 'unknown_function';
const logName = process.env.LOGNAME || 'sigfox-aws';
if (process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.indexOf('AWS_Lambda') >= 0 && !isProduction) {
  //  Confirm that NODE_ENV is set to "production".  This is enforced in Google Cloud but not AWS.
  throw new Error('NODE_ENV must be set to "production" in AWS Lambda environment');
}
process.env.AWS_XRAY_DEBUG_MODE = 'TRUE';
process.env.PACKAGE_VERSION = require('./package.json').version;
console.log({ gcloud_aws_version: process.env.PACKAGE_VERSION });

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Utility Functions

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Instrumentation Functions: Trace the execution of this Sigfox Callback across multiple Cloud Functions via AWS X-Ray

// eslint-disable-next-line no-unused-vars
//  Allow AWS X-Ray to capture trace.
//  eslint-disable-next-line import/no-unresolved
const AWSXRay = require('aws-xray-sdk-core');
AWSXRay.setStreamingThreshold(0);  //  TODO: Send XRay events immediately.
AWSXRay.middleware.setSamplingRules({ // eslint-disable-next-line object-property-newline
  rules: [{ description: 'sigfox-aws', service_name: '*', http_method: '*', url_path: '/*', // eslint-disable-next-line object-property-newline
    fixed_target: 0, rate: 1.0,
  }],
  default: { fixed_target: 0, rate: 1.0 },
  version: 1,
});

//  Extend the AWS whitelist to allow these functions to log.
AWSXRay.appendAWSWhitelist({
  services: {
    xray: {
      operations: {
        putTraceSegments: {},
      },
    },
    iot: {
      operations: {
        describeEndpoint: {},
      },
    },
    iotdata: {
      operations: {
        publish: {},
      },
    },
  },
});

//  Create the AWS SDK instance.
const AWS = isProduction
  ? AWSXRay.captureAWS(require('aws-sdk'))
  : require('aws-sdk');
if (isProduction) AWS.config.update({ region: process.env.AWS_REGION });
else AWS.config.loadFromPath('./aws-credentials.json');

//  TODO: Create spans and traces for logging performance.
const rootSpanStub = {
  startSpan: (/* rootSpanName, labels */) => ({
    end: () => ({}),
  }),
  end: () => ({}),
};

// eslint-disable-next-line no-unused-vars
const NOTUSED = `const rootTraceStub = {  // new tracingtrace(tracing, rootTraceId);
  startSpan: (/* rootSpanName, labels */) => rootSpanStub,
  end: () => ({}),
};

const tracing = { startTrace: () => rootTraceStub };`;

let parentSegmentId = null;
let childSegmentId = null;
let parentSegment = null;
let childSegment = null;
let traceId = null;

const prefix = ['a', process.env.PACKAGE_VERSION.split('.').join(''), '_'].join(''); //

function sendSegment(segment) {
  //  Send the segment to AWS.
  const params = {
    TraceSegmentDocuments: [
      JSON.stringify(segment),
    ],
  };
  const xray = new AWS.XRay();
  xray.putTraceSegments(params).promise()
    .catch(error => console.error('sendSegment', segment, error.message, error.stack));
}

function openSegment(traceId0, segmentId, parentSegmentId0, name, annotations) {
  //  Open the segment.
  const newSegment = {
    // service: 'myservice',
    // version: '1.23',
    // user: 'user1',
    name: (prefix + name).split('/').join('_'),
    id: segmentId,
    start_time: Date.now() / 1000.0,
    trace_id: traceId0,
    in_progress: true,
  };
  if (parentSegmentId0) newSegment.parent_id = parentSegmentId0;
  Object.assign(newSegment, { annotations });
  sendSegment(newSegment);
  return newSegment;
}

function closeSegment(segment) {
  //  Close the segment.
  //  eslint-disable-next-line no-param-reassign
  segment.end_time = Date.now() / 1000.0; // eslint-disable-next-line no-param-reassign
  if (segment.in_progress) delete segment.in_progress;
  sendSegment(segment);
}

function newSegmentId() {
  //  Return a new segment ID to identify the segment of running code trace.
  //  Segment IDs must be 16 hex digits.  We simply take the current epoch time
  //  and convert to hex.
  const trace_id_time = Math.floor(Date.now() / 1000).toString(16);
  let segmentId = (`0000000000000000${trace_id_time}`);
  segmentId = segmentId.substr(segmentId.length - 16);  //  16-digits
  return segmentId;
}

function startTrace(/* req */) {
  //  Start the trace.  Called by sigfoxCallback to start a trace.
  //  Create the root segment.
  const segment = AWSXRay.getSegment();
  traceId = (segment && segment.trace_id) ? segment.trace_id : null;
  parentSegmentId = segment.id;
  console.log('startTrace', segment); //

  const rootTraceStub = {  // new tracingtrace(tracing, rootTraceId);
    traceId: [traceId, parentSegmentId].join('|'),
    startSpan: (/* rootSpanName, labels */) => rootSpanStub,
    end: () => ({}),
  };
  const tracing = { startTrace: () => rootTraceStub };
  return tracing.startTrace();
}

function createRootTrace(req, traceId0, traceSegment0) {
  //  Return the root trace for instrumentation.  Called by
  //  non-sigfoxCallback (e.g. routeMessage) to continue a trace.
  if (traceSegment0) {
    parentSegment = JSON.parse(JSON.stringify(traceSegment0));
    traceId = parentSegment.trace_id;
    parentSegmentId = parentSegment.id;
  }
  console.log('createRootTrace - parentSegment:', parentSegment);

  //  Create the child segment.
  if (parentSegmentId) {
    childSegmentId = newSegmentId();
    childSegment = openSegment(traceId, childSegmentId, parentSegmentId, functionName);
    console.log('createRootTrace - childSegment:', childSegment);
  }

  //  Close the parent segment.
  if (parentSegment) {
    console.log('Close parentSegment', parentSegment);
    closeSegment(parentSegment);
    parentSegment = null;
  }

  //  Get trace ID and segment ID.
  /* const segment = AWSXRay.getSegment();
  traceId = (segment && segment.trace_id) ? segment.trace_id : null;
  const segmentId = segment.id; */

  //  Create a subsegment and set it as the active segment.
  /* const subsegment = segment.addNewSubsegment(`z${prefix}${functionName}`);
  AWSXRay.setSegment(subsegment);
  console.log('createRootTrace', 'segment', segment, 'subsegment', subsegment); */

  const rootTraceStub = {  // new tracingtrace(tracing, rootTraceId);
    traceId: [traceId, parentSegmentId].join('|'),
    startSpan: (/* rootSpanName, labels */) => rootSpanStub,
    end: () => ({}),
  };
  return rootTraceStub;
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Logging Functions: Log to AWS CloudWatch

//  Logger object for AWS.
const loggingLog = {
  write: (/* entry */) => {
    //  Write the log entry to AWS CloudWatch.
    //  console.log(stringify(entry ? entry.event || '' : '', null, 2));
    return Promise.resolve({});
  },
  entry: (metadata, event) => {
    //  Create the log event.
    console.log(JSON.stringify(event, null, 2));
    return ({ metadata, event });
  },
};

/* metadata looks like {
  timestamp: '2017-11-25T14:10:37.669Z',
  severity: 'DEBUG',
  operation: {
    id: 'saveMessage_1037-3e363ed3-e368-4013-9776-41cd3392f461',
    producer: 'unabiz.com',
    first: true,
    last: false,
  },
  resource: {
    type: 'cloud_function',
    labels: {function_name: 'sigfoxCallback'},
  }};
event looks like {
  '____[ 1A2345 ]____saveMessage___________': {
    device: '1A2345',
    body: {
      uuid: 'df0cbceb-00f3-4be2-add1-a32ffdee9773',
      datetime: '2017-11-25 14:10:37',
      localdatetime: '2017-11-25 22:10:37',
      callbackTimestamp: 1511619037666,
      device: '1A2345',
      data: 'b0513801a421f0019405a500',
      duplicate: false,
      snr: 18.86,
      station: '1D44',
      avgSnr: 15.54,
      lat: 1,
      lng: 104,
      rssi: -123,
      seqNumber: 1508,
      ack: false,
      longPolling: false,
      timestamp: '1511814827000',
      baseStationTime: 1511814827,
    },
    duration: 0,
  }}; */

function getLogger() {
  //  Return the logger object for writing logs.
  return loggingLog;
}

function reportError(/* req. err, action, para */) {
  //  TODO: Report error to CloudWatch.
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Metadata Functions: Read function metadata from environment

function authorizeFunctionMetadata(/* req */) {
  //  Authorize access to function metadata.  On AWS do nothing.
  return Promise.resolve({ result: 'OK' });
}

function getFunctionMetadata(/* req, authClient */) {
  //  Returns a promise for function metadata keys and values: { key1: val1, key2: val2, ... }
  //  In lieu of the metadata store, we read from the environment variables.
  //  This is done in sigfox-iot-cloud.getMetadata.
  return Promise.resolve({});
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Messaging Functions: Dispatch messages between Cloud Functions via AWS IoT MQTT Queues

const Iot = new AWS.Iot();
let awsIoTDataPromise = null;

function sendIoTMessage(req, topic0, payload0 /* , subsegmentId, parentId */) {
  //  Send the text message to the AWS IoT MQTT queue name.
  //  In Google Cloud topics are named like sigfox.devices.all.  We need to rename them
  //  to AWS MQTT format like sigfox/devices/all.
  const topic = (topic0 || '').split('.').join('/');
  const payloadObj = JSON.parse(payload0);
  //  TODO: Obsolete.
  if (traceId && childSegmentId) payloadObj.rootTraceId = [traceId, childSegmentId].join('|');
  if (traceId && childSegmentId) {
    //  Create a new segment with annotations to AWS but remove them from the payload.
    const segmentId = newSegmentId();
    const annotations = {};
    const body = payloadObj.body || {};
    for (const key of Object.keys(body)) {
      //  Log only scalar values.
      const val = body[key];
      if (val === null || val === undefined) continue;
      if (typeof val === 'object') continue;
      annotations[key] = val;
    }
    const segment = openSegment(traceId, segmentId, childSegmentId, `sendto_${topic}`, annotations);
    const segmentWithoutAnnotations = Object.assign({}, segment);
    if (segmentWithoutAnnotations.annotations) delete segmentWithoutAnnotations.annotations;
    payloadObj.traceSegment = JSON.parse(JSON.stringify(segmentWithoutAnnotations));
    console.log('sendIoTMessage', segment);
  }
  /* const subsegment = new AWSXRay.Subsegment(topic.split('/').join('_'));
  console.log('sendIoTMessage', subsegment); */

  const payload = JSON.stringify(payloadObj);
  const params = { topic, payload, qos: 0 };
  module.exports.log(req, 'sendIoTMessage', { topic, payloadObj, params }); // eslint-disable-next-line no-use-before-define
  return getIoTData(req)
    .then(IotData => IotData.publish(params).promise())
    .then(result => module.exports.log(req, 'sendIoTMessage', { result, topic, payloadObj, params }))
    .catch((error) => { module.exports.error(req, 'sendIoTMessage', { error, topic, payloadObj, params }); throw error; });
}

/* function sendSQSMessage(req, topic0, msg) {
  //  Send the text message to the AWS Simple Queue Service queue name.
  //  In Google Cloud topics are named like sigfox.devices.all.  We need to rename them
  //  to AWS SQS format like sigfox-devices-all.
  const msgObj = JSON.parse(msg);
  const topic = (topic0 || '').split('.').join('-');
  const url = `${SQS.endpoint.href}${topic}`;
  const params = {
    MessageBody: msg,
    QueueUrl: url,
    DelaySeconds: 0,
    MessageAttributes: {
      device: {
        DataType: 'String',
        StringValue: msgObj.device || 'missing_device',
      },
    },
  };
  module.exports.log(req, 'awsSendSQSMessage', { topic, url, msgObj, params });
  return SQS.sendMessage(params).promise()
    .then(result => module.exports.log(req, 'awsSendSQSMessage', { result, topic, url, msgObj, params }))
    .catch((error) => { module.exports.error(req, 'awsSendSQSMessage', { error, topic, url, msgObj, params }); throw error; });
} */

function getQueue(req, projectId0, topicName) {
  //  Return the AWS IoT MQTT Queue and AWS Simple Queue Service queue with that name
  //  for that project.  Will be used for publishing messages, not reading.
  const topic = {
    name: topicName,
    publisher: () => ({
      publish: (buffer) => {
        // let subsegment = null;
        /*
        return new Promise((resolve) => {
          //  Publish the message body as an AWS X-Ray annotation.
          //  This allows us to trace the message processing through AWS X-Ray.
          AWSXRay.captureAsyncFunc(topicName, (subsegment0) => {
            subsegment = subsegment0;
            try {
              const msg = JSON.parse(buffer.toString());
              const body = msg.body || msg;
              if (!body) {
                console.log('awsGetTopic', 'no_body');
                return resolve('no_body');
              }
              for (const key of Object.keys(body)) {
                //  Log only scalar values.
                const val = body[key];
                if (val === null || val === undefined) continue;
                if (typeof val === 'object') continue;
                subsegment.addAnnotation(key, val);
              }
            } catch (error) {
              console.error('awsGetTopic', error.message, error.stack);
            }
            return resolve('OK');
          });
        })
        */
        return Promise.resolve('OK')
          .then(() => sendIoTMessage(req, topicName, buffer.toString() /* , subsegmentId, parentId */).catch(module.exports.dumpError))
          // TODO: sendSQSMessage(req, topicName, buffer.toString()).catch(module.exports.dumpError),
          .then((res) => {
            // TODO: if (subsegment) subsegment.close();
            return res;
          })
          .catch(error => error);
      },
    }),
  };
  return topic;
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Device State Functions: Memorise the device state with AWS IoT Thing Shadows

function getIoTData(/* req */) {
  //  Return a promise for the IotData object for updating message queue
  //  and device state.
  if (awsIoTDataPromise) return awsIoTDataPromise;
  awsIoTDataPromise = Iot.describeEndpoint({}).promise()
    .then((res) => {
      const IotData = new AWS.IotData({ endpoint: res.endpointAddress });
      return IotData;
    })
    .catch((error) => {
      awsIoTDataPromise = null;
      throw error;
    });
  return awsIoTDataPromise;
}

function createDevice(req, device0) {
  //  Create the AWS Thing with the device name if it doesn't exist.  device is the
  //  Sigfox device ID.
  if (!device0) throw new Error('missing_deviceid');
  //  Capitalise device ID but not device names.
  const device = device0.length > 6 ? device0 : device0.toUpperCase();
  const params = { thingName: device };
  console.log({ describeThing: params });
  //  Lookup the device.
  return Iot.describeThing(params).promise()
  //  Device exists.
    .then(result => module.exports.log(req, 'awsCreateDevice', { result, device, params }))
    //  Device is missing. Create it.
    .catch(() => console.log({ createThing: params }) || Promise.resolve(null)
      .then(() => Iot.createThing(params).promise())
      .then(result => module.exports.log(req, 'awsCreateDevice', { result, device, params }))
      .catch((error) => { module.exports.error(req, 'awsCreateDevice', { error, device, params }); throw error; }));
}

function getDeviceState(req, device0) {
  //  Fetch the AWS IoT Thing state for the device ID.  Returns a promise.
  //  Result looks like {"reported":{"deviceLat":1.303224739957452,...
  if (!device0) throw new Error('missing_deviceid');
  //  Capitalise device ID but not device names.
  const device = device0.length > 6 ? device0 : device0.toUpperCase();
  const params = { thingName: device };
  console.log({ getThingShadow: params });
  //  Get a connection for AWS IoT Data.
  return getIoTData(req)
  //  Fetch the Thing state.
    .then(IotData => IotData.getThingShadow(params).promise())
    //  Return the payload.state.
    .then(res => (res && res.payload) ? JSON.parse(res.payload) : res)
    .then(res => (res && res.state) ? res.state : res)
    .then(result => module.exports.log(req, 'awsGetDeviceState', { result, device, params }))
    .catch((error) => { module.exports.error(req, 'awsGetDeviceState', { error, device, params }); throw error; });
}

// eslint-disable-next-line no-unused-vars
function updateDeviceState(req, device0, state) {
  //  Update the AWS IoT Thing state for the device ID.  Returns a promise.
  //  Overwrites the existing Thing attributes with the same name.
  if (!device0) throw new Error('missing_deviceid');
  //  Capitalise device ID but not device names.
  const device = device0.length > 6 ? device0 : device0.toUpperCase();
  const payload = {
    state: {
      reported: state,
    },
  };
  const params = {
    payload: JSON.stringify(payload),
    thingName: device,
  };
  console.log({ updateThingShadow: params });
  //  Get a connection for AWS IoT Data.
  return getIoTData(req)
  //  Update the Thing state.
    .then(IotData => IotData.updateThingShadow(params).promise())
    .then(result => module.exports.log(req, 'awsUpdateDeviceState', { result, device, state, payload, params }))
    .catch((error) => { module.exports.error(req, 'awsUpdateDeviceState', { error, device, state, payload, params }); throw error; });
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Startup

function prepareRequest(event /* context */) {
  //  Prepare the request object and return it.
  const body = (typeof event.body === 'string')
    ? JSON.parse(event.body)  //  For HTTP request.
    : null;  //  For queue requests.
  return { body, returnStatus: null, returnJSON: null };
}

/* body looks like {
  device: '1A2345',
  data: 'b0513801a421f0019405a500',
  time: '1507112763',
  duplicate: 'false',
  snr: '18.86',
  station: '1D44',
  avgSnr: '15.54',
  lat: '1',
  lng: '104',
  rssi: '-123.00',
  seqNumber: '1508',
  ack: 'false',
  longPolling: 'false',
}; */

function done(req, error, result, statusCode0, callback) {
  //  Return a statusCode and JSON response to the HTTP request.  If error is set return the error
  //  else return the result.  If statusCode is null,
  //  return 200 or 500 depending on where the error
  //  is absent or present.
  return callback(null, {
    statusCode: statusCode0 || (error ? 500 : 200),
    body: error ? error.message : JSON.stringify(result),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function init(event, context, callback, task) {
  //  Run the function in the wrapper, passed as "this".
  //  Call the callback upon success or failure.
  //  Returns a promise.
  console.log('init', { event, context, callback, task, env: process.env });

  /* if (event && event.rootTraceId) {
    //  Set the environment for AWS Xray tracing.
    //  _X_AMZN_TRACE_ID: 'Root=1-5a24ba7c-4cfeb71c7b94c50c2f420a8c;Parent=6d0cb8bb50733c26;Sampled=1',
    const splitId = event.rootTraceId.split('|');
    traceId = splitId[0];
    parentSegmentId = splitId[1];
    process.env._X_AMZN_TRACE_ID = `Root=${traceId};Parent=${parentSegmentId};Sampled=1`;
    console.log('Updated _X_AMZN_TRACE_ID', process.env._X_AMZN_TRACE_ID);
  } */
  if (event && event.traceSegment) {
    //  Set the environment for AWS Xray tracing.
    //  _X_AMZN_TRACE_ID: 'Root=1-5a24ba7c-4cfeb71c7b94c50c2f420a8c;Parent=6d0cb8bb50733c26;Sampled=1',
    parentSegment = JSON.parse(JSON.stringify(event.traceSegment));
    traceId = parentSegment.trace_id;
    parentSegmentId = parentSegment.id;
    process.env._X_AMZN_TRACE_ID = `Root=${traceId};Parent=${parentSegmentId};Sampled=1`;
    console.log('Updated _X_AMZN_TRACE_ID', process.env._X_AMZN_TRACE_ID);
  }

  //  Allow AWS X-Ray to capture trace.
  // eslint-disable-next-line import/no-unresolved,global-require,no-unused-vars
  const NOTUSED3 = `AWSXRay = require('aws-xray-sdk-core');
  AWSXRay.middleware.setSamplingRules({
    rules: [{ description: 'sigfox-aws', service_name: '*', http_method: '*', url_path: '/*', fixed_target: 0, rate: 0.5 }],
    default: { fixed_target: 1, rate: 0.5 },
    version: 1,
  });
  //  Create the AWS SDK instance.
  AWS = isProduction // eslint-disable-next-line global-require
    ? AWSXRay.captureAWS(require('aws-sdk')) // eslint-disable-next-line global-require
    : require('aws-sdk');
  if (isProduction) AWS.config.update({ region: process.env.AWS_REGION });
  else AWS.config.loadFromPath('./aws-credentials.json');
  Iot = new AWS.Iot();
  awsIoTDataPromise = null;`;
  //

  //  This tells AWS to quit as soon as we call callback.  Else AWS will wait
  //  for all functions to stop running.  This causes some background functions
  //  to hang e.g. the knex library in sigfox-aws-data. Also this setting allows us
  //  to cache variables across Lambda invocations.
  //  eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;
  //  Prepare the request and result objects.
  const req = prepareRequest(event, context);
  //  Result object that wii be passed to wrapper.
  const res = {   //  Simulates some functions of the ExpressJS Response object.
    status: (code) => {
      //  Return HTTP response code.
      req.returnStatus = code;
      return res;
    },
    json: (obj) => {
      //  Return HTTP response JSON.
      req.returnJSON = obj;
      return res;
    },
    end: () => {
      //  End the request.  We return the response code and JSON.
      const error = null;
      done(req, error, req.returnJSON, req.returnStatus, callback);
      return res;
    },
  };
  req.res = res;  //  Save the response object in the request for easy reference.
  const result = { req, res };
  if (event) result.event = event;
  if (context) result.context = context;
  if (callback) {
    //  Save the callback for use in shutdown().
    req.callback = callback;
    result.callback = callback;
  }
  if (task) result.task = task;
  return result;
}

function shutdown(req, useCallback, error, result) {
  //  Close all cloud connections.  If useCallback is true, return the error or result
  //  to AWS through the callback.
  if (parentSegment) {
    console.log('Close parentSegment', parentSegment);
    closeSegment(parentSegment);
    parentSegment = null;
  }
  if (childSegment) {
    console.log('Close childSegment', childSegment);
    closeSegment(childSegment);
    childSegment = null;
  }
  //  console.log('shutdown', { useCallback, error, result, callback: req.callback }); //
  /* AWS = null; //
  AWSXRay = null; //
  Iot = null; //
  awsIoTDataPromise = null; // */

  if (useCallback) {  //  useCallback is normally true except for sigfoxCallback.
    const callback = req.callback;
    if (callback && typeof callback === 'function') {
      return Promise.resolve(callback(error, result));
    }
  }
  return Promise.resolve(error || result);
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Module Exports

//  Here are the functions specific to AWS.  We will expose the sigfox-iot-cloud interface which is common to Google Cloud and AWS.
const cloud = {
  isGoogleCloud,
  isAWS,
  projectId: null,
  functionName,
  logName,
  sourceName: process.env.AWS_LAMBDA_FUNCTION_NAME || logName,
  credentials: null,  //  No credentials needed.

  //  Logging
  getLogger,
  reportError,

  //  Instrumentation
  startTrace,
  createRootTrace,

  //  Messaging
  getQueue,

  //  Metadata
  authorizeFunctionMetadata,
  getFunctionMetadata,

  //  Device State
  createDevice,
  getDeviceState,
  updateDeviceState,

  //  Startup
  init,
  shutdown,
};

//  Functions common to Google Cloud and AWS are exposed here.  So clients of both clouds will see the same interface.
module.exports = require('sigfox-iot-cloud')(cloud);

//  For Unit Test
module.exports.getAWSXRay = () => AWSXRay;
module.exports.getAWS = () => AWS;

//  //////////////////////////////////////////////////////////////////////////////////// endregion
