//  Lambda Function sigfoxCallback is exposed as a HTTPS service
//  that Sigfox Cloud will callback when delivering a Sigfox message.
//  We insert the Sigfox message into message queues:
//  (1) sigfox.devices.all (the queue for all devices)
//  (2) sigfox.devices.<deviceID> (the device specific queue)
//  (3) sigfox.types.<deviceType> (the specific device type e.g. gps)

//  We will return the HTTPS response immediately to Sigfox Cloud while
//  the processing of the Sigfox continues with other Lambda Functions.

//  This code is critical, all changes must be reviewed.  It must be
//  kept as simple as possible to reduce the chance of failure.

/* eslint-disable camelcase, no-console, no-nested-ternary, import/no-dynamic-require, import/newline-after-import, import/no-unresolved, global-require, max-len */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AutoInstall: List all dependencies here, or just paste the contents of package.json. Autoinstall will install these dependencies.

const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */

  {
    "name": "sigfoxCallback",
    "version": "0.0.1",
    "author": {
      "name": "Lee Lup Yuen",
      "email": "ly.lee@unabiz.com",
      "url": "http://github.com/unabiz/"
    },
    "license": "MIT",
    "engines": {
      "node": ">=6.7.0"
    },
    "dependencies": {
      "dnscache": "^1.0.1",
      "dotenv": "^4.0.0",
      "sigfox-aws": "UnaBiz/sigfox-aws",
      "safe-buffer": "5.0.1",
      "node-fetch": "^1.6.3",
      "json-stringify-safe": "^5.0.1",
      "uuid": "^3.1.0"
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/UnaBiz/sigfox-aws.git"
    }
  }

; /* eslint-enable quote-props,quotes,comma-dangle,indent */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AWS Lambda Startup

const mainReq = {};
const mainRes = {
  status: (/* code */) => mainRes,  //  TODO
  json: (/* json */) => mainRes,  //  TODO
  end: () => mainRes,
};

function prepareRequest() {
  //  Prepare the request and result objects.
  mainReq.body = {
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
  };
}

// eslint-disable-next-line arrow-body-style
exports.handler = (event, context, callback) => {
  //  Install the dependencies from package_json above.  Will reload the script.
  //  eslint-disable-next-line no-use-before-define
  return autoInstall(package_json, event, context, callback)
    .then((installed) => {
      if (!installed) return null;  //  Dependencies installing now.  Wait until this Lambda reloads.

      //  Dependencies loaded, so we can use require here.
      //  Prepare the request and result objects.
      prepareRequest();  //  eslint-disable-next-line no-use-before-define
      return wrap().main(mainReq, mainRes)
        .then(() => callback(null, `Complete! ${__filename}`))
        .catch(error => callback(error));
    })
    .catch(error => callback(error));
};

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Code for Google Cloud and AWS

function wrap() {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.

  require('dnscache')({ enable: true });  //  Enable DNS cache in case we hit the DNS quota
  process.on('uncaughtException', err => console.error(err.message, err.stack));  //  Display uncaught exceptions.
  process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection at:', p, 'reason:', reason));
  const uuid = require('uuid');
  const scloud = require('sigfox-aws'); //  sigfox-aws Framework

  function getResponse(req, device0, body /* , msg */) {
    //  Compose the callback response to Sigfox Cloud and return as a promise.
    //  If body.ack is true, then we must wait for the result and return to Sigfox as the downlink data.
    //  Else tell Sigfox we will not be returning any downlink data.
    //  This lets us route the Sigfox message to another Cloud Function
    //  for processing, without Sigfox Cloud waiting for us.
    const device = device0 || 'missing_device';
    const response = {};
    if (body.ack === false || body.ack === 'false') {
      //  No downlink needed.
      response[device] = { noData: true };
      return Promise.resolve(response);
    }
    //  Wait for the result.  Must be 8 bytes hex.
    //  TODO: We hardcode the result for now.
    const result = '0123456789abcdef';
    if (result.length !== 16) throw new Error(`Result must be 8 bytes: ${result}`);
    Array.from(result.toLowerCase()).forEach((s) => {
      if (s[0] < '0' || s[0] > 'f' || (s[0] > '9' && s[0] < 'a')) {
        throw new Error(`Invalid hex digit in result: ${s[0]}`);
      }
    });
    response[device] = { downlinkData: result };
    return Promise.resolve(response);
  }

  function saveMessage(req, device, type, body, rootTraceId) {
    //  Save the message to in 3 message queues:
    //  (1) sigfox.devices.all (the queue for all devices)
    //  (2) sigfox.devices.<deviceID> (the device specific queue)
    //  (3) sigfox.types.<deviceType> (the specific device type e.g. gps)
    //  There may be another Cloud Function waiting on sigfox.devices.all
    //  to process this message e.g. routeMessage.
    //  Where does type come from?  It's specified in the callback URL
    //  e.g. https://myproject.appspot.com?type=gps
    scloud.log(req, 'saveMessage', { device, type, body, rootTraceId });
    const queues = [
      { device },  //  sigfox.devices.<deviceID> (the device specific queue)
      { device: 'all' },  //  sigfox.devices.all (the queue for all devices)
    ];
    if (type) queues.push({ type });  //  sigfox.types.<deviceType>
    const query = req.query;
    //  Compose the message and record the history.
    const message0 = { device, type, body, query, rootTraceId };
    const message = scloud.updateMessageHistory(req, message0, device);
    //  Get a list of promises, one for each publish operation to each queue.
    const promises = [];
    for (const queue of queues) {
      //  Send message to each queue, either the device ID or message type queue.
      const promise = scloud.publishMessage(req, message, queue.device, queue.type)
        .catch((error) => {
          scloud.log(req, 'saveMessage', { error, device, type, body, rootTraceId });
          return error;  //  Suppress the error so other sends can proceed.
        });
      promises.push(promise);
    }
    //  Wait for the messages to be published to the queues.
    return Promise.all(promises)
    //  Return the message with dispatch flag set so we don't resend.
      .then(() => scloud.log(req, 'saveMessage', { result: message, device, type, body, rootTraceId }))
      .then(() => Object.assign({}, message, { isDispatched: true }))
      .catch((error) => { throw error; });
  }

  function parseBool(s) {
    //  Parse a string to boolean.
    return s === 'true';
  }

  function parseSIGFOXMessage(req, body0) {  /* eslint-disable no-param-reassign */
    //  Convert Sigfox body from string to native types.
    /* body contains (Callbacks -> Body):  Example:
     {                                      {
     "device" : "{device}",               "device":"1CB0B8",
     "data" : "{data}",                   "data":"81543795",
     "time" : "{time}",                   "time":"1476980426",
     "duplicate": "{duplicate}",          "duplicate":"false",
     "snr": "{snr}",                      "snr":"18.86",
     "station": "{station}",              "station":"1D44",
     "avgSnr": "{avgSnr}",                "avgSnr":"15.54",
     "lat": "{lat}",                      "lat":"1",
     "lng": "{lng}",                      "lng":"104",
     "rssi": "{rssi}",                    "rssi":"-123.00",
     "seqNumber": "{seqNumber}",          "seqNumber":"1492",
     "ack": "{ack}",                      "ack":"false",
     "longPolling": "{longPolling}"       "longPolling":"false"
     }                                      }
     */
    const body = Object.assign({}, body0);  //  Clone the body.
    if (body.time) {
      body.time = parseInt(body.time, 10);  //  Milliseconds.
      body.timestamp = `${body.time * 1000}`;
      //  Delete "time" field because it's a special field in InfluxDB.
      body.baseStationTime = body.time;
      delete body.time;
    }
    //  Convert the text fields to boolean, int, float.
    if (body.duplicate) body.duplicate = parseBool(body.duplicate);
    if (body.snr) body.snr = parseFloat(body.snr);
    if (body.avgSnr) body.avgSnr = parseFloat(body.avgSnr);
    if (body.lat) body.lat = parseInt(body.lat, 10);
    if (body.lng) body.lng = parseInt(body.lng, 10);
    if (body.rssi) body.rssi = parseFloat(body.rssi);
    if (body.seqNumber) body.seqNumber = parseInt(body.seqNumber, 10);
    if (body.ack) body.ack = parseBool(body.ack);
    if (body.longPolling) body.longPolling = parseBool(body.longPolling);
    return body;
  } /* eslint-enable no-param-reassign */

  function task(req, device, body0, msg) {
    //  Parse the Sigfox fields and send to the queues for device ID and device type.
    //  Then send the HTTP response back to Sigfox cloud.  If there is downlink data, wait for the response.
    const res = req.res;
    const type = msg.type;
    const rootTraceId = msg.rootTraceId;
    //  Convert the text fields into number and boolean values.
    const body = parseSIGFOXMessage(req, body0);
    let result = null;
    //  Send the Sigfox message to the 3 queues.
    return saveMessage(req, device, type, body, rootTraceId)
      .then((newMessage) => { result = newMessage; return newMessage; })
      //  Wait for the downlink data if any.
      .then(() => getResponse(req, device, body0, msg))
      //  Return the response to Sigfox Cloud.
      .then(response => res.status(200).json(response).end())
      .then(() => result)
      .catch((error) => { throw error; });
  }

  function main(req0, res) {
    //  This function is exposed as a HTTP request to handle callbacks from
    //  Sigfox Cloud.  The Sigfox message is contained in the request.body.
    //  Get the type from URL e.g. https://myproject.appspot.com?type=gps
    const req = Object.assign({}, req0);  //  Clone the request.
    req.res = res;
    req.starttime = Date.now();
    //  Start a root-level span to trace the request across Cloud Functions.
    const rootTrace = scloud.startRootSpan(req).rootTrace;
    const rootTraceId = rootTrace.traceId;  //  Pass to other Cloud Functions.
    req.rootTraceId = rootTraceId;

    const event = null;
    const type = (req.query && req.query.type) || null;
    const uuid0 = uuid.v4();  //  Assign a UUID for message tracking.
    const callbackTimestamp = Date.now();  //  Timestamp for callback.
    const datetime = new Date(callbackTimestamp)
      .toISOString().replace('T', ' ')
      .substr(0, 19); //  For logging to Google Sheets.
    //  Save the UUID, datetime and callback timestamp into the message.
    const body = Object.assign({ uuid: uuid0, datetime, callbackTimestamp },
      req.body);
    //  Get the device ID.
    const device = (body.device && typeof body.device === 'string')
      ? body.device.toUpperCase()
      : req.query.device
        ? req.query.device.toUpperCase()
        : null;
    const oldMessage = { device, body, type, rootTraceId };
    let updatedMessage = oldMessage;
    scloud.log(req, 'start', { device, body, event, rootTraceId });

    //  Now we run the task to publish the message to the 3 queues.
    //  Wait for the task to complete then dispatch to next step.
    const runTask = task(req, device, body, oldMessage)
      .then(result => scloud.log(req, 'result', { result, device, body, event, oldMessage }))
      .then((result) => { updatedMessage = result; return result; })
      .catch(error => scloud.log(req, 'error', { error, device, body, event, oldMessage }));
    const dispatchTask = runTask
    //  Dispatch will be skipped because isDispatched is set.
      .then(() => scloud.dispatchMessage(req, updatedMessage, device))
      .catch(error => scloud.log(req, 'error', { error, device, body, event, updatedMessage }));
    return dispatchTask
    //  Flush the log and wait for it to be completed.
      .then(() => scloud.endTask(req))
      .then(() => updatedMessage);
  }

  // eslint-disable-next-line no-shadow
  function test() {
    const req = {};
    const msg = {};
    scloud.log(req, 'action123/subAction456', { result: 'OK', number: 789, obj: { level1: { level2: {} } }, msg });
    scloud.log(req, 'action123/subAction456', { error: new Error('This is the error message'), number: 789, obj: { level1: { level2: {} } }, msg });
    return scloud.flushLog(req);
  }

  return {
    //  Expose these functions outside of the wrapper.
    main,
    test,  //  Testing
  };
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Standard Code for AutoInstall.  Do not change.  https://github.com/UnaBiz/sigfox-aws/blob/master/autoinstall.js

/* eslint-disable curly, brace-style, import/no-absolute-path */
let autoinstallPromise = null;  //  Cached autoinstall module.
function autoInstall(package_json0, event0, context0, callback0) {
  //  Set up autoinstall to install any NPM dependencies.  Returns a promise
  //  for "true" when the autoinstall has completed and the script has relaunched.
  //  Else return a promise for "false" to indicate that dependencies are being installed.
  if (__filename.indexOf('/tmp') === 0) return Promise.resolve(true);
  const sourceCode = require('fs').readFileSync(__filename);
  if (!autoinstallPromise) autoinstallPromise = new Promise((resolve, reject) => {
    //  Copy autoinstall.js from GitHub to /tmp and load the module.
    //  TODO: If script already in /tmp, use it.  Else download from GitHub.
    require('https').get(`https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js?random=${Date.now()}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; }); // Accumulate the data chunks.
      res.on('end', () => { //  After downloading from GitHub, save to /tmp amd load the module.
        require('fs').writeFileSync('/tmp/autoinstall.js', body);
        return resolve(require('/tmp/autoinstall')); }); })
      .on('error', (err) => { autoinstallPromise = null; console.error('setupAutoInstall failed', err.message, err.stack); return reject(err); }); });
  return autoinstallPromise
    .then(mod => mod.install(package_json0, event0, context0, callback0, sourceCode))
    .then(() => false)
    .catch((error) => { throw error; });
} /* eslint-enable curly, brace-style, import/no-absolute-path */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Expected Output

/*
*/

//  //////////////////////////////////////////////////////////////////////////////////// endregion

