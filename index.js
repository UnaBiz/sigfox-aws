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
AWSXRay.middleware.setSamplingRules({
  default: {
    fixed_target: 100,  //  default 1
    rate: 0.90,  //  default 0.05
  },
  version: 1,
});

//  Clear the AWS Xray whitelist to disallow any AWS functions to be traced.
/* AWSXRay.setAWSWhitelist({
  services: {
  },
}); */

//  Clear the AWS Xray whitelist and allow only AWS Lambda to be traced.
/* AWSXRay.setAWSWhitelist({
  services: {
    lambda: {
      operations: {
        invoke: {
          request_parameters: [
            'FunctionName',
            'InvocationType',
            'LogType',
            'Qualifier',
          ],
          response_parameters: [
            'FunctionError',
            'StatusCode',
          ],
        },
        invokeAsync: {
          request_parameters: [
            'FunctionName',
          ],
          response_parameters: [
            'Status',
          ],
        },
      },
    },
  },
}); */

//  Extend the AWS Xray whitelist to allow these functions to log.
/* AWSXRay.appendAWSWhitelist({
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
}); */

//  Create the AWS SDK instance.  aws-sdk is automatically provided in AWS Lambda, no need to add to dependencies.
//  eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');  //  Disable Xray logging for AWS requests.
/* const AWS = isProduction
  ? AWSXRay.captureAWS(require('aws-sdk')) //  Enable Xray logging for AWS requests.
  : require('aws-sdk'); */
if (isProduction) AWS.config.update({ region: process.env.AWS_REGION });
else AWS.config.loadFromPath('./aws-credentials.json');

//  TODO: Create spans and traces for logging performance.
const rootSpanStub = {
  startSpan: (/* rootSpanName, labels */) => ({
    end: () => ({}),
  }),
  end: () => ({}),
};

//  Remember the current AWS XRay trace.
let parentSegmentId = null;
let childSegmentId = null;
let parentSegment = null;
let childSegment = null;
let traceId = null;

//  Prefix all segment names by the version number.
//  const namePrefix = ['a', process.env.PACKAGE_VERSION.split('.').join(''), '_'].join('');
const namePrefix = '';  //  No prefix for segment name.

//  Random prefix for segment ID.
let segmentPrefix = '';

function sendSegment(segment) {
  //  Send the AWS XRay segment to AWS. Returns a promise.
  const params = {
    TraceSegmentDocuments: [
      JSON.stringify(segment),
    ],
  };
  const xray = new AWS.XRay();
  return xray.putTraceSegments(params).promise()
    .then((res) => { console.log('sendSegment', segment, res); return res; })
    .catch(error => console.error('sendSegment', segment, error.message, error.stack));
}

function openSegment(traceId0, segmentId, parentSegmentId0, name0, user, annotations, metadata, startTime, comment) {
  //  Create a new AWS XRay segment and send to AWS.  startTime (optional) is number of milliseconds since Jan 1 1970.
  const suffix = ` (${process.env.PACKAGE_VERSION.split('.').join('')})`;
  const name = (namePrefix && namePrefix.length > 0)
    ? name0.replace(namePrefix, '')
    : name0;
  let method = '';
  let url = suffix;
  if (comment) {
    const commentSplit = comment.split(' ', 2);
    method = commentSplit[0].toUpperCase();
    url = comment.substr(method.length + 1) + suffix;
  }
  // const device = (annotations && annotations.device !== undefined) ? annotations.device : '';
  const seqNumber = (annotations && annotations.seqNumber !== undefined) ? annotations.seqNumber : 0;
  const newSegment = {
    /* service: {
      name: 'sigfox',
    }, */
    name: (namePrefix || '') + name,
    id: segmentId,
    start_time: (startTime || Date.now()) / 1000.0,
    trace_id: traceId0,
    in_progress: true,
    http: {
      request: {
        //  Log the device ID and sequence number into the URL.
        method,
        url,
        client_ip: `${seqNumber}.0.0.0`,
      },
      response: {
        content_length: -1,
        status: seqNumber,
      },
    },
  };
  if (parentSegmentId0) newSegment.parent_id = parentSegmentId0;
  if (user) newSegment.user = user;
  if (annotations) newSegment.annotations = annotations;
  if (metadata) newSegment.metadata = metadata;
  sendSegment(newSegment);
  return newSegment;
}

function closeSegment(segment) {
  //  Close the AWS XRay segment by sending the segment with end time to AWS.
  //  Returns a promise.
  //  eslint-disable-next-line no-param-reassign
  segment.end_time = Date.now() / 1000.0; // eslint-disable-next-line no-param-reassign
  if (segment.in_progress) delete segment.in_progress;
  return sendSegment(segment)
    .catch(error => console.error('closeSegment', error.message, error.stack));
}

/* function newTraceId() {
  //  Return a new Xray trace ID to identify a new request.
  const trace_id_time = Math.floor(Date.now() / 1000).toString(16);
  const trace_id = `1-${trace_id_time}-123456789012345678901234`;  //  8 then 24 hex digits
  return trace_id;
} */

function composeTraceAnnotations(payload) {
  //  Compose an AWS XRay Annotations object from the payload body.
  //  The annotations object will contain the Sigfox message values.
  const annotations = {};
  //  Get the values from body, else from payload if already expanded.
  const body = payload.body || payload || {};
  for (const key of Object.keys(body)) {
    //  Log only scalar values.
    const val = body[key];
    if (val === null || val === undefined) continue;
    if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') continue;
    annotations[key] = val;
  }
  return annotations;
}

function getTraceMetadata(payload) {
  //  Return the metadata from the payload that will be logged to AWS XRay.  This should be everything in the
  //  message except the Sigfox message body, which is already in Annotations.
  const metadata = Object.assign({}, payload.metadata || payload || {});
  //  Delete the body if it exists.
  if (metadata.body) delete metadata.body;
  return metadata;
}

function newSegmentId() {
  //  Return a new XRay segment ID to identify the segment of running request code trace.
  //  Segment IDs must be 16 hex digits.  We simply take the current epoch time
  //  and convert to hex.
  const timeHex = Math.floor(Date.now()).toString(16);
  let segmentId = (`0000000000000000${segmentPrefix}0${timeHex}`);
  segmentId = segmentId.substr(segmentId.length - 16);  //  16-digits
  return segmentId;
}

function getLambdaPrefix(annotations) {
  //  Prefix Lambda name by device ID.
  return (annotations && annotations.device) // eslint-disable-next-line prefer-template
    ? annotations.device + '_@_'
    : '';
}

function startTrace(/* req */) {
  //  Start the trace.  Called by sigfoxCallback to start a trace.
  console.log('startTrace - parentSegment', parentSegment);

  //  Create the child segment to represent sigfoxCallback.
  if (parentSegment) {
    const name = `${getLambdaPrefix(parentSegment.annotations)}${functionName}`;
    const comment = `Run Lambda Func ${functionName}`;
    childSegmentId = newSegmentId();
    childSegment = openSegment(traceId, childSegmentId, parentSegmentId, name,
      parentSegment.user, parentSegment.annotations, parentSegment.metadata, null, comment);
    console.log('startTrace - childSegment:', childSegment);
  }
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
  //  We continue the trace passed by the previous Lambda and create a child segment.
  if (traceSegment0) {
    //  Resume the segment from the previous Lambda.
    traceId = traceSegment0.trace_id;
    parentSegmentId = traceSegment0.id;
    parentSegment = openSegment(traceId, parentSegmentId, traceSegment0.parent_id, traceSegment0.name,
      traceSegment0.user, traceSegment0.annotations, traceSegment0.metadata,
      traceSegment0.metadata.startTime, traceSegment0.metadata.comment);
    console.log('createRootTrace - parentSegment:', parentSegment);
  }
  //  Create the child segment.
  if (parentSegment) {
    const name = `${getLambdaPrefix(parentSegment.annotations)}${functionName}`;
    const comment = `Run Lambda Func ${functionName}`;
    childSegmentId = newSegmentId();
    childSegment = openSegment(traceId, childSegmentId, parentSegmentId, name,
      parentSegment.user, parentSegment.annotations, parentSegment.metadata, null, comment);
    console.log('createRootTrace - childSegment:', childSegment);

    //  Close the parent segment.
    closeSegment(parentSegment);
    console.log('Close parentSegment', parentSegment);
    parentSegment = null;
  }
  const rootTraceStub = {
    traceId: [traceId, parentSegmentId].join('|'),
    startSpan: (/* rootSpanName, labels */) => rootSpanStub,
    end: () => ({}),
  };
  return rootTraceStub;
}

function initTrace(event, context) {
  //  During startup, create the trace segments.
  const startTime = context.autoinstallStart;  //  Use autoinstall start time as start time.
  const body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body;
  const annotations = composeTraceAnnotations(body);
  const metadata = getTraceMetadata(event);
  const prefix = getLambdaPrefix(annotations);
  console.log('initTrace', { body, annotations, metadata });

  if (process.env._X_AMZN_TRACE_ID && !event.traceSegment) {
    //  This is the first Lambda in the chain, i.e. sigfoxCallback.
    //  For sigfoxCallback, we create a new segment and specify the URL.
    //  Set the environment for AWS XRay tracing based on a new trace ID.

    //  Get the trace ID from environment.
    //  _X_AMZN_TRACE_ID contains 'Root=1-5a24ba7c-4cfeb71c7b94c50c2f420a8c;Parent=6d0cb8bb50733c26;Sampled=1',
    const fields = process.env._X_AMZN_TRACE_ID.split(';');
    const parsedFields = {};
    for (const field of fields) {
      const fieldSplit = field.split('=');
      const key = fieldSplit[0];
      const val = fieldSplit[1];
      parsedFields[key] = val;
    }
    traceId = parsedFields.Root;
    const rootSegmentId = parsedFields.Parent;

    //  Create a new segment.
    const comment = 'Receive message from Sigfox via HTTP POST Callback';
    parentSegmentId = newSegmentId();
    parentSegment = openSegment(traceId, parentSegmentId, rootSegmentId, prefix + functionName,
      annotations.device, annotations, metadata, startTime, comment);
  } else if (event.traceSegment) {
    //  This is the second or later Lambda in the chain, e.g. routeMessage, decodeStructuredMessage.
    //  Set the environment for AWS XRay tracing based on the traceSegment passed by previous Lambda.
    //  _X_AMZN_TRACE_ID will become 'Root=1-5a24ba7c-4cfeb71c7b94c50c2f420a8c;Parent=6d0cb8bb50733c26;Sampled=1',
    parentSegment = JSON.parse(JSON.stringify(event.traceSegment));
    traceId = parentSegment.trace_id;
    parentSegmentId = parentSegment.id;
  }
  //  Update the environment.
  process.env._X_AMZN_TRACE_ID = `Root=${traceId};Parent=${parentSegmentId};Sampled=1`;

  //  Create a segment for autoinstall and close it.
  let autoinstallSegment = null;
  if (startTime) {
    //  name = 2C30EB_@_autoinstall_sigfoxCallback
    const name = `${prefix}autoinstall_${functionName}`;
    const comment = `Autoinstall modules for ${functionName}`;
    autoinstallSegment = openSegment(traceId, newSegmentId(), parentSegmentId, name,
      annotations.device, annotations, metadata, startTime, comment);
    closeSegment(autoinstallSegment);
  }
  console.log('initTrace parentSegment', parentSegment, '_X_AMZN_TRACE_ID', process.env._X_AMZN_TRACE_ID,
    { autoinstallSegment });
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region File Functions: Store and retrieve files from AWS S3 storage

const s3 = new AWS.S3();

function writeFile(req, bucket, name, obj) {
  //  Write file to S3 bucket.  Serialise the object to JSON.  Returns a promise.
  const params = {
    Body: JSON.stringify(obj),
    Bucket: bucket,
    Key: name,
  };
  return s3.putObject(params).promise()
    .catch((error) => {
      module.exports.error(req, 'writeFile', { error, bucket, name });
      throw error;
    });
}

function readFile(req, bucket, name) {
  //  Read file from S3 bucket.  Returns a promise for a JavaScript object.
  const params = {
    Bucket: bucket,
    Key: name,
  };
  return s3.getObject(params).promise()
    .then(res => (res && res.Body) ? JSON.parse(res.Body) : null)
    .catch((error) => {
      module.exports.error(req, 'readFile', { error, bucket, name });
      throw error;
    });
}

function deleteFile(req, bucket, name) {
  //  Delete file from S3 bucket.  Returns a promise.
  const params = {
    Bucket: bucket,
    Key: name,
  };
  s3.deleteObject(params).promise()
    .catch((error) => {
      module.exports.error(req, 'deleteFile', { error, bucket, name });
      throw error;
    });
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

function createQueueSegment(req, topic, payloadObj) {
  //  Create a child segment for the message queue of the message. Pass the new segment through traceSegment in the message.
  //  Write the segment to S3 storage so that processIoTLogs can match up with AWS IoT log.
  if (!childSegment) return null;
  const annotations = composeTraceAnnotations(payloadObj);
  const metadata = getTraceMetadata(payloadObj) || {};
  const device = payloadObj.device || payloadObj.body.device || '';
  const name = `==_${device}_@_${topic}_==`;
  const comment = 'Send message to MQTT queue';
  const startTime = null;
  metadata.startTime = startTime;
  metadata.comment = comment;
  const segment = openSegment(traceId, newSegmentId(), childSegmentId, name, device, annotations, metadata,
    startTime, comment);
  /* eslint-disable no-param-reassign */
  payloadObj.traceSegment = segment;
  payloadObj.rootTraceId = [traceId, segment.id].join('|');  //  For info, not really used.
  /* eslint-enable no-param-reassign */
  //  Send the message to the trace queue for processIoTLogs to match up AWS IoT Rules and Lambda invocations.
  //  The trace topic looks like sigfox/trace/<deviceid>-<segmentid>
  const traceName = `${device}-${segment.id}`;
  const traceTopic = `sigfox/trace/${traceName}`;
  if (process.env.TRACE_BUCKET) {
    //  Save the trace file for processIoTLogs to retrieve and match later.
    writeFile(req, process.env.TRACE_BUCKET, `${traceName}.json`, segment)
      .catch(error => console.error('createQueueSegment', error.message, error.stack));
  }
  console.log('createQueueSegment - segment:', segment, traceTopic);
  return traceTopic;
}

function sendIoTMessage(req, topic0, payload0) {
  //  Send the text message to the AWS IoT MQTT queue name.
  //  In Google Cloud topics are named like sigfox.devices.all.  We need to rename them
  //  to AWS MQTT format like sigfox/devices/all.
  const topic = (topic0 || '').split('.').join('/');
  //  We inject a segment for the queue, e.g. ==_sigfox/types/routeMessage_==
  const payloadObj = JSON.parse(payload0);
  const traceTopic = createQueueSegment(req, topic, payloadObj);
  const payload = JSON.stringify(payloadObj);
  //  Send the message to AWS IoT MQTT queue.
  const params = { topic, payload, qos: 0 };
  //  Send the message to the trace queues for processIoTLogs to match up AWS IoT Rules and Lambda invocations.
  const beginTrace = traceTopic ? { topic: `${traceTopic}/begin`, payload: '{}', qos: 0 } : null;
  const endTrace = traceTopic ? { topic: `${traceTopic}/end`, payload: '{}', qos: 0 } : null;
  let IotData = null;
  let result = null;
  module.exports.log(req, 'sendIoTMessage', { topic, payloadObj, params, beginTrace, endTrace }); // eslint-disable-next-line no-use-before-define
  return getIoTData(req)
    .then((res) => { IotData = res; })
    //  Send begin trace message.
    .then(() => (beginTrace === null) || IotData.publish(beginTrace).promise()  //  Ignore any trace errors.
      .catch(error => console.error('begin trace', error.message, error.stack)))
    //  Send actual message.
    .then(() => IotData.publish(params).promise())
    .then((res) => { result = res; })
    //  Send end trace message.
    .then(() => (endTrace === null) || IotData.publish(endTrace).promise()  //  Ignore any trace errors.
      .catch(error => console.error('end trace', error.message, error.stack)))
    .then(() => {
      module.exports.log(req, 'sendIoTMessage', { result, topic, payloadObj, params });
      return result;
    })
    .catch((error) => { module.exports.error(req, 'sendIoTMessage', { error, topic, payloadObj, params }); throw error; });
}

/* AWS IoT Log will look like:
2017-12-06 14:13:58.484 TRACEID:15ef61e1-693b-9011-14f7-f64f9bd47c4b PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.484 TRACEID:15ef61e1-693b-9011-14f7-f64f9bd47c4b PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60272
2017-12-06 14:13:58.547 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.547 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60274
2017-12-06 14:13:58.606 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-06 14:13:58.606 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-06 14:13:58.645 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:112039193356:function:routeMessage StatusCode: 202, Function error: null
2017-12-06 14:13:58.670 TRACEID:55c11976-fbec-df43-86a3-3295ba6f1b89 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.670 TRACEID:55c11976-fbec-df43-86a3-3295ba6f1b89 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60276
2017-12-06 14:14:14.188 TRACEID:190cf061-c801-0527-e3f7-59f0ba46a8e2 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-0c4501602c2d4a99/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.188 TRACEID:190cf061-c801-0527-e3f7-59f0ba46a8e2 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60156
2017-12-06 14:14:14.252 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.252 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60158
2017-12-06 14:14:14.295 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-06 14:14:14.295 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage
2017-12-06 14:14:14.307 TRACEID:05dfc479-2f1f-a81a-d026-ea60251f6dfc PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-0c4501602c2d4a99/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.307 TRACEID:05dfc479-2f1f-a81a-d026-ea60251f6dfc PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60160
2017-12-06 14:14:14.368 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:112039193356:function:decodeStructuredMessage StatusCode: 202, Function error: null
2017-12-06 14:14:29.866 TRACEID:23879b7b-6e19-9953-2c54-6b225c311d04 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09b201602c2d878d/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.866 TRACEID:23879b7b-6e19-9953-2c54-6b225c311d04 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54546
2017-12-06 14:14:29.909 TRACEID:1665a4b5-d525-6e12-893e-cc1be9089d0e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.909 TRACEID:1665a4b5-d525-6e12-893e-cc1be9089d0e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54548
2017-12-06 14:14:29.948 TRACEID:fc66921e-3f4d-7f22-ede1-30e9a4f76b05 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09b201602c2d878d/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.948 TRACEID:fc66921e-3f4d-7f22-ede1-30e9a4f76b05 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54550
 */
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
      //  Calling publish on this queue will send an AWS IoT MQTT message.
      publish: buffer => sendIoTMessage(req, topicName, buffer.toString())
          .catch(error => console.error('getQueue', error.message, error.stack)),
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

function prepareRequest(event, context) {
  //  Prepare the request object and return it.
  const body = (typeof event.body === 'string')
    ? JSON.parse(event.body)  //  For HTTP request.
    : null;  //  For queue requests.
  return { body, returnStatus: null, returnJSON: null, requestId: context ? context.awsRequestId : null };
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
  //  Generate a random prefix for the AWS XRay segment ID.
  segmentPrefix = Math.floor(Math.random() * 10000).toString(16);
  //  Create the segments for AWS XRay tracing.
  initTrace(event, context);

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
  const promises = [];
  if (childSegment) {
    promises.push(closeSegment(childSegment)
      .then((res) => { console.log('Close childSegment', res, childSegment); childSegment = null; return res; })
      .catch(err => console.error('shutdown child', err.message, err.stack)));
  }
  if (parentSegment) {
    promises.push(closeSegment(parentSegment)
      .then((res) => { console.log('Close parentSegment', res, parentSegment); parentSegment = null; return res; })
      .catch(err => console.error('shutdown parent', err.message, err.stack)));
  }
  return Promise.all(promises)
    .then((res) => {
      console.log('shutdown', res);
      if (useCallback) {  //  useCallback is normally true except for sigfoxCallback.
        const callback = req.callback;
        if (callback && typeof callback === 'function') {
          return Promise.resolve(callback(error, result));
        }
      }
      return Promise.resolve(error || result);
    })
    .catch(err => console.error('shutdown', err.message, err.stack));
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

  //  File
  readFile,
  writeFile,
  deleteFile,

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
