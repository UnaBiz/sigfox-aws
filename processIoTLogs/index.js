//  processIoTLogs Installation Instructions:
//  In AWS IoT -> Settings, enable detailed tracing
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: processIoTLogs
//  Runtime: Node.js 6.10
//  Handler: index.main
//  Memory: 512 MB
//  Timeout: 5 min
//  Existing Role: lambda_iot Role, which has the LambdaExecuteIoTUpdate Policy
//    (defined in ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: DISABLE active tracing
//  Environment Variables:
//    NODE_ENV=production
//    TRACE_BUCKET=sigfox-trace-???

//  Add Trigger:
//  CloudWatch Logs
//  Log Group: AWSIotLogs
//  Filter Name: processIoTLogs
//  Filter Pattern: (Blank)
//  Enable Trigger: Yes

/* eslint-disable max-len, camelcase, no-console, no-nested-ternary, import/no-dynamic-require, import/newline-after-import, import/no-unresolved, global-require */
//  Parse the AWS IoT Log in CloudWatch format that is passed in as the
//  parameter. Watch for any IoT Rules and Lambda Functions executed.  If detected, fetch the AWS XRay
//  segment from AWS S3 storage and open/close the segments.
//  We use AutoInstall to install any Node.js libraries automatically, without manually packaging them.
//  See https://github.com/UnaBiz/sigfox-iot-cloud/blob/master/autoinstall.js
//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AutoInstall: List all dependencies here, or just paste the contents of package.json. Autoinstall will install these dependencies.
//  Don't include sigfox-aws, it will be automatically added as dependencies.

const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
{
}
//  PASTE PACKAGE.JSON ABOVE  //////////////////////////////////////////////////////////
; /* eslint-enable quote-props,quotes,comma-dangle,indent */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Message Processing Code

/* AWS IoT Log will look like:
2017-12-06 14:13:58.484 TRACEID:15ef61e1-693b-9011-14f7-f64f9bd47c4b PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.484 TRACEID:15ef61e1-693b-9011-14f7-f64f9bd47c4b PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60272
>>>
[7] segment-1A2345-098901602c2d0d08.json = (segment)
[3] segment-1A2345-098901602c2d0d08-trace.json = { trace: 15ef61e1-693b-9011-14f7-f64f9bd47c4b }
    trace-15ef61e1-693b-9011-14f7-f64f9bd47c4b-begin.json = { segment: 1A2345-098901602c2d0d08 }
[4] trace-15ef61e1-693b-9011-14f7-f64f9bd47c4b-address.json = { address: 13.229.60.16, port: 60272 }
    address-13.229.60.16-60272.json = { trace: 15ef61e1-693b-9011-14f7-f64f9bd47c4b }

2017-12-06 14:13:58.547 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/received MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.547 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60274
2017-12-06 14:13:58.606 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
2017-12-06 14:13:58.606 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/received
2017-12-06 14:13:58.645 TRACEID:0be5ef8f-0de3-a345-ff4d-79967f07b24e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:112039193356:function:routeMessage StatusCode: 202, Function error: null
>>>
    trace-0be5ef8f-0de3-a345-ff4d-79967f07b24e-address.json = { address: 13.229.60.16, port: 60274 }
[5] address-13.229.60.16-60274.json = { trace: 0be5ef8f-0de3-a345-ff4d-79967f07b24e }
[6] trace-0be5ef8f-0de3-a345-ff4d-79967f07b24e-rule.json = { rule: sigfoxRouteMessage }

?? Starting execution of LambdaAction on topic sigfox/received
?? Successfully invoked lambda function. Message arrived on: sigfox/received, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:112039193356:function:routeMessage StatusCode: 202, Function error: null

2017-12-06 14:13:58.670 TRACEID:55c11976-fbec-df43-86a3-3295ba6f1b89 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:13:58.670 TRACEID:55c11976-fbec-df43-86a3-3295ba6f1b89 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:sigfoxCallback [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60276
>>>
[2] trace-55c11976-fbec-df43-86a3-3295ba6f1b89-end.json = { segment: 1A2345-098901602c2d0d08 }
[1] trace-55c11976-fbec-df43-86a3-3295ba6f1b89-address.json = { address: 13.229.60.16, port: 60276 }
    address-13.229.60.16-60276.json = { trace: 55c11976-fbec-df43-86a3-3295ba6f1b89 }

-----
2017-12-06 14:14:14.188 TRACEID:190cf061-c801-0527-e3f7-59f0ba46a8e2 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-0c4501602c2d4a99/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.188 TRACEID:190cf061-c801-0527-e3f7-59f0ba46a8e2 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60156

2017-12-06 14:14:14.252 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/decodeStructuredMessage MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.252 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60158
2017-12-06 14:14:14.295 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:MatchingRuleFound TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Matching rule found: sigfoxDecodeStructuredMessage
2017-12-06 14:14:14.295 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [DEBUG] EVENT:LambdaActionStart TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Starting execution of LambdaAction on topic sigfox/types/decodeStructuredMessage

2017-12-06 14:14:14.307 TRACEID:05dfc479-2f1f-a81a-d026-ea60251f6dfc PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-0c4501602c2d4a99/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:14.307 TRACEID:05dfc479-2f1f-a81a-d026-ea60251f6dfc PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60160

2017-12-06 14:14:14.368 TRACEID:b67a9142-d0b8-ded4-dc99-45680d213b61 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:routeMessage [INFO] EVENT:LambdaActionSuccess TOPICNAME:sigfox/types/decodeStructuredMessage CLIENTID:N/A MESSAGE:Successfully invoked lambda function. Message arrived on: sigfox/types/decodeStructuredMessage, Action: lambda, Function: arn:aws:lambda:ap-southeast-1:112039193356:function:decodeStructuredMessage StatusCode: 202, Function error: null

-----
2017-12-06 14:14:29.866 TRACEID:23879b7b-6e19-9953-2c54-6b225c311d04 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09b201602c2d878d/begin MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.866 TRACEID:23879b7b-6e19-9953-2c54-6b225c311d04 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54546

2017-12-06 14:14:29.909 TRACEID:1665a4b5-d525-6e12-893e-cc1be9089d0e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/types/sendToUbidots MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.909 TRACEID:1665a4b5-d525-6e12-893e-cc1be9089d0e PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54548

2017-12-06 14:14:29.948 TRACEID:fc66921e-3f4d-7f22-ede1-30e9a4f76b05 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09b201602c2d878d/end MESSAGE:PublishIn Status: SUCCESS
2017-12-06 14:14:29.948 TRACEID:fc66921e-3f4d-7f22-ede1-30e9a4f76b05 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO] EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 54550
 */

function wrap(scloud) {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.
  //  eslint-disable-next-line import/no-extraneous-dependencies
  //  const scloud = require('sigfox-aws'); //  sigfox-aws Framework
  const zlib = require('zlib');  //  Provided by AWS Lambda.
  let wrapCount = 0;  //  Count how many times the wrapper has been reused.

  function parseLine(req, line) {
    // line contains
    // 2017-12-06 16:05:20.742 TRACEID:b7e75c76-4c27-b1b8-9d08-44ebeeb6a991 PRINCIPALID:AROAJF6KEGSLSKFIDBJH4:decodeStructuredMessage [INFO]  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-09a101602c9303d7/begin MESSAGE:PublishIn Status: SUCCESS
    if (!line || line.trim() === '') return {};
    const timestamp = new Date(`${line.substr(0, 23).replace(' ', 'T')}Z`).valueOf();
    const lineSplit = line.split('MESSAGE:');
    const fields = lineSplit[0];
    const message = lineSplit[1];
    const fieldsSplit = fields.split(' ');
    const result = { timestamp };
    if (message) result.message = message;
    for (const field of fieldsSplit) {
      //  field contains key:value
      //  Skip number and [] fields.
      if (!field || !field[0]) continue;
      const ch = field[0];
      if (ch >= '0' && ch <= '9') continue;
      if (ch === '[') continue;
      const fieldSplit = field.split(':', 2);
      if (fieldsSplit.length < 2) continue;
      const key = fieldSplit[0];
      const val = field.substr(key.length + 1);
      result[key] = val;
    }
    if (message) {
      //  message contains
      //  IpAddress: 13.229.60.16 SourcePort: 60272
      const msgFields = parseLine(req, message.trim().split(': ').join(':'));
      Object.assign(result, msgFields);
    }
    return result;
  }

  function writeLine(req, prefix, name, suffix, fields) { // eslint-disable-next-line prefer-template
    const filename = `${prefix ? prefix + '-' : ''}${name}${suffix ? '-' + suffix : ''}.json`;
    return scloud.writeFile(req, process.env.TRACE_BUCKET, filename, fields)
      .catch((error) => { console.error('writeLine', filename, error.message, error.stack); throw error; });
  }

  function readLine(req, prefix, name, suffix) { // eslint-disable-next-line prefer-template
    const filename = `${prefix ? prefix + '-' : ''}${name}${suffix ? '-' + suffix : ''}.json`;
    return scloud.readFile(req, process.env.TRACE_BUCKET, filename)
      .catch((error) => { console.error('readLine', filename, error.message, error.stack); throw error; });
  }

  function processLine(req, line) {
    //  Returns a promise.
    const promises = [];
    const fields = parseLine(req, line);
    if (fields.TRACEID) fields.trace = fields.TRACEID;
    switch (fields.EVENT) {
      case 'PublishEvent': {
        //  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/begin MESSAGE:PublishIn Status: SUCCESS
        //  EVENT:PublishEvent TOPICNAME:sigfox/trace/1A2345-098901602c2d0d08/end MESSAGE:PublishIn Status: SUCCESS
        //  EVENT:PublishEvent MESSAGE: IpAddress: 13.229.60.16 SourcePort: 60272
        if (fields.TOPICNAME && fields.TOPICNAME.indexOf('sigfox/trace/') === 0) {
          const topicSplit = fields.TOPICNAME.split('/');
          fields.segment = topicSplit[2];  //  1A2345-098901602c2d0d08.
          fields.marker = topicSplit[3];  //  begin or end.
          //  segment-1A2345-098901602c2d0d08-begin.json = { trace: 15ef61e1-693b-9011-14f7-f64f9bd47c4b }
          promises.push(writeLine(req, 'segment', fields.segment, fields.marker, fields));
          //  trace-15ef61e1-693b-9011-14f7-f64f9bd47c4b-begin.json = { segment: 1A2345-098901602c2d0d08 }
          promises.push(writeLine(req, 'trace', fields.trace, fields.marker, fields));
        } else if (fields.IpAddress && fields.SourcePort) {
          fields.address = fields.IpAddress;  //  13.229.60.16
          fields.port = parseInt(fields.SourcePort, 10);  //  60272
          //  trace-15ef61e1-693b-9011-14f7-f64f9bd47c4b-address.json = { address: 13.229.60.16, port: 60272 }
          promises.push(writeLine(req, 'trace', fields.trace, 'address', fields));
          //  address-13.229.60.16-60272.json = { trace: 15ef61e1-693b-9011-14f7-f64f9bd47c4b }
          promises.push(writeLine(req, 'address', fields.address, fields.port, fields));
        }
        break;
      }
      case 'MatchingRuleFound': {
        //  EVENT:MatchingRuleFound TOPICNAME:sigfox/received CLIENTID:N/A MESSAGE:Matching rule found: sigfoxRouteMessage
        fields.rule = fields.found;
        //  trace-0be5ef8f-0de3-a345-ff4d-79967f07b24e-rule.json = { rule: sigfoxRouteMessage }
        promises.push(writeLine(req, 'trace', fields.trace, 'rule', fields));
        break;
      }
      default: break;
    }
    return Promise.all(promises)
      .then(() => fields);
  }

  function matchTrace(req, endTrace) {
    //  Match the historical AWS IoT logs.  Look for begin trace and end trace messages, match them
    //  and return the segment and rule.
    const fields = { endTrace };
    //  Given trace 55c11976-fbec-df43-86a3-3295ba6f1b89, find:
    //  [1] trace-55c11976-fbec-df43-86a3-3295ba6f1b89-address.json = { address: 13.229.60.16, port: 60276 }
    return readLine(req, 'trace', fields.endTrace, 'address')
      .then((res) => { fields.endAddress = res.address; fields.endPort = res.port; })
    //  [2] trace-55c11976-fbec-df43-86a3-3295ba6f1b89-end.json = { segment: 1A2345-098901602c2d0d08 }
      .then(() => readLine(req, 'trace', fields.endTrace, 'end'))
      .then((res) => { fields.segment = res.segment; })
    //  [3] segment-1A2345-098901602c2d0d08-begin.json = { trace: 15ef61e1-693b-9011-14f7-f64f9bd47c4b }
      .then(() => readLine(req, 'segment', fields.segment, 'begin'))
      .then((res) => { fields.beginTrace = res.trace; })
    //  [4] trace-15ef61e1-693b-9011-14f7-f64f9bd47c4b-address.json = { address: 13.229.60.16, port: 60272 }
      .then(() => readLine(req, 'trace', fields.beginTrace, 'address'))
      .then((res) => { fields.beginAddress = res.address; fields.beginPort = res.port; })
    //  [5] address-13.229.60.16-60274.json = { trace: 0be5ef8f-0de3-a345-ff4d-79967f07b24e }
      .then(() => {
        //  Confirm that beginAddress = endAddress.
        if (fields.beginAddress !== fields.endAddress) throw new Error('mismatched_address');
        //  Loop from beginPort + 1 to endPort - 1.
        const promises = [];
        for (let port = fields.beginPort + 1; port <= fields.endPort - 1; port += 1) {
          //  Check whether the port exists.
          promises.push(readLine(req, 'address', fields.beginAddress, port)
            .then((res) => {
              //  Found the port.  Save the trace.
              fields.resultAddress = fields.beginAddress;
              fields.resultPort = port;
              fields.resultTrace = res.trace;
            })
            .catch(() => null));  //  Suppress any not-found errors.
        }
        return Promise.all(promises);
      })
      .then(() => { if (!fields.resultTrace) throw new Error('port_not_found'); })
    //  [6] trace-0be5ef8f-0de3-a345-ff4d-79967f07b24e-rule.json = { rule: sigfoxRouteMessage }
      .then(() => readLine(req, 'trace', fields.resultTrace, 'rule'))
      .then((res) => { fields.rule = res.rule; fields.timestamp = res.timestamp; })
      //  [7] segment-1A2345-098901602c2d0d08.json = (segment)
      //  Return the fields for the caller to close fields.segment=segment-1A2345-098901602c2d0d08
      .then(() => scloud.log(req, 'matchTrace', { result: fields }))
      .then(() => fields)
      .catch(() => { // eslint-disable-next-line no-param-reassign
        scloud.error(req, 'matchTrace', { result: `[${Object.keys(fields).length}] ${endTrace}` });
        return null;
      });
  }

  function updateTraceSegments(req, fields) {
    //  Read the sender, rule, receiver segments from S3 and open/close them.
    const segment = fields.segment;
    return readLine(req, 'segment', segment, null)
      .then((res) => {
        const senderSegment = res.senderSegment;
        const ruleSegment = res.ruleSegment;
        // const receiverSegment = res.receiverSegment;

        const device = ruleSegment.user; // eslint-disable-next-line no-param-reassign
        req.device = device;

        ruleSegment.name = `${device}_@_RULE_${fields.rule}`;
        ruleSegment.start_time = fields.timestamp / 1000.0; // eslint-disable-next-line no-param-reassign
        ruleSegment.end_time = ruleSegment.start_time + 1;
        if (ruleSegment.in_progress) delete ruleSegment.in_progress;
        scloud.sendTrace(req, ruleSegment);

        senderSegment.end_time = fields.timestamp / 1000.0; // eslint-disable-next-line no-param-reassign
        if (senderSegment.in_progress) delete senderSegment.in_progress;
        scloud.sendTrace(req, senderSegment);
        const result = { ruleSegment, senderSegment };
        scloud.log(req, 'updateTraceSegments', { result, fields });
        return result;
      })
      .catch((error) => { console.error('updateTraceSegments', segment, fields, error); throw error; });
  }

  function task(req, lines) {
    //  The task for this Cloud Function: Parse the AWS IoT Log in CloudWatch format that is passed in as the
    //  parameter. Watch for any IoT Rules and Lambda Functions executed.  If detected, fetch the AWS XRay
    //  segment from AWS S3 storage and open/close the segments.
    wrapCount += 1; console.log({ wrapCount });  //  Count how many times the wrapper has been reused.
    const matches = [];
    const promises = lines.map(line => processLine(req, line)
      .then(res => matchTrace(req, res.trace))
      .then((res) => { if (res) matches.push(res); })
      .catch((error) => { console.error('task', error.message, error.stack); }));
    return Promise.all(promises)
      .then(() => Promise.all(matches.map(match =>
        updateTraceSegments(req, match)
          .catch((error) => { console.error('task2', error.message, error.stack); return error; }))))
      .then(result => result)
      .catch((error) => { throw error; });
  }

  function main(event, context, callback) {
    const req = {};
    const payload = new Buffer(event.awslogs.data, 'base64');
    zlib.gunzip(payload, (err, res) => {
      if (err) { return callback(err); }
      const parsed = JSON.parse(res.toString('utf8'));
      console.log('Decoded payload:', JSON.stringify(parsed));
      const lines = parsed.logEvents.map(ev => ev.message);
      return task(req, lines)
        .then(() => callback(null, `Successfully processed ${parsed.logEvents.length} log events.`))
        .catch(error => callback(error));
    });
  }

  //  Unit Test
  if (process.env.NODE_ENV !== 'production') return { task, parseLine, processLine, matchTrace, updateTraceSegments };

  //  Expose these functions outside of the wrapper.
  //  When this Cloud Function is triggered, we call main() which calls task().
  return { main };
}

//  Unit Test
if (process.env.NODE_ENV !== 'production') module.exports = wrap(require('../index'));

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Standard Code for AutoInstall Startup Function 1.0.  Do not modify.  https://github.com/UnaBiz/sigfox-iot-cloud/blob/master/autoinstall.js
/*  eslint-disable camelcase,no-unused-vars,import/no-absolute-path,import/no-unresolved,no-use-before-define,global-require,max-len,no-tabs,brace-style,import/no-extraneous-dependencies */
const wrapper = {};  //  The single reused wrapper instance (initially empty) for invoking the module functions.
exports.main = process.env.FUNCTION_NAME ? require('sigfox-gcloud/main').getMainFunction(wrapper, wrap, package_json)  //  Google Cloud.
  : (event, context, callback) => {
    const afterExec = error => error ? callback(error, 'AutoInstall Failed')
      : require('/tmp/autoinstall').installAndRunWrapper(event, context, callback, package_json, __filename, wrapper, wrap);
    if (require('fs').existsSync('/tmp/autoinstall.js')) return afterExec(null);  //  Already downloaded.
    const cmd = 'curl -s -S -o /tmp/autoinstall.js https://raw.githubusercontent.com/UnaBiz/sigfox-iot-cloud/master/autoinstall.js';
    const child = require('child_process').exec(cmd, { maxBuffer: 1024 * 500 }, afterExec);
    child.stdout.on('data', console.log); child.stderr.on('data', console.error); return null; };
//  exports.main is the startup function for AWS Lambda and Google Cloud Function.
//  When AWS starts our Lambda function, we load the autoinstall script from GitHub to install any NPM dependencies.
//  For first run, install the dependencies specified in package_json and proceed to next step.
//  For future runs, just execute the wrapper function with the event, context, callback parameters.
//  //////////////////////////////////////////////////////////////////////////////////// endregion
