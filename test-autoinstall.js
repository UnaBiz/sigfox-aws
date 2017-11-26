/* eslint-disable camelcase,max-len,global-require,import/no-unresolved */
const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
  { "dependencies": {
    "dnscache": "^1.0.1",
    "sigfox-aws": ">=1.0.9",
    "uuid": "^3.1.0" } };

// eslint-disable-next-line no-unused-vars
const isGoogleCloud = !!process.env.FUNCTION_NAME || !!process.env.GAE_SERVICE;
const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Code for Google Cloud and AWS

function wrap() {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.
  function main(event, context, callback) {
    const scloud = require('sigfox-aws');
    console.log('main', { event, context, callback, scloud });
    return callback(null, 'OK');
  }
  //  Expose these functions outside of the wrapper.
  //  "main" is called to execute the wrapped function when the dependencies and wrapper have been loaded.
  return { main };
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Standard Code for AutoInstall Startup Function.  Do not modify.  https://github.com/UnaBiz/sigfox-aws/blob/master/autoinstall.js
/* eslint-disable camelcase,no-unused-vars,import/no-absolute-path,import/no-unresolved,no-use-before-define,global-require,max-len,no-tabs,brace-style */
const wrapper = {};  //  The single reused wrapper instance (initially empty) for invoking the module functions.
exports.main = isGoogleCloud ? require('sigfox-gcloud/lib/main').getMainFunction(wrapper, wrap, package_json)
  : (event, context, callback) => { //  exports.main is the startup function for AWS Lambda and Google Cloud Function.
    //  When AWS starts our Lambda function, we load the autoinstall script from GitHub to install any NPM dependencies.
    //  For first run, install the dependencies specified in package_json and proceed to next step.
    //  For future runs, just execute the wrapper function with the event, context, callback parameters.
    const afterExec = error => error ? callback(error, 'AutoInstall Failed')
      : require('/tmp/autoinstall').installAndRunWrapper(event, context, callback,
        package_json, __filename, wrapper, wrap);
    if (require('fs').existsSync('/tmp/autoinstall.js')) return afterExec(null);  //  Already downloaded.
    const cmd = 'curl -s -S -o /tmp/autoinstall.js https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js';
    const child = require('child_process').exec(cmd, { maxBuffer: 1024 * 500 }, afterExec);
    child.stdout.on('data', console.log); child.stderr.on('data', console.error); return null; };
//  //////////////////////////////////////////////////////////////////////////////////// endregion

/* Expected Output:
START RequestId:  Version: $LATEST
2017-11-26T03:11:21.775Z		total 12
-rw-rw-r-- 1 sbx_user1064 482 5120 Nov 26 03:11 autoinstall.js
-rw-rw-r-- 1 sbx_user1064 482 103 Nov 26 03:11 package.json

2017-11-26T03:11:40.396Z		/tmp
├─┬ dnscache@1.0.1
│ ├── asap@2.0.6
│ └─┬ lodash.clone@4.3.2
│ └── lodash._baseclone@4.5.7
├─┬ sigfox-aws@1.0.9
│ ├─┬ aws-sdk@2.156.0
│ │ ├─┬ buffer@4.9.1
│ │ │ ├── base64-js@1.2.1
│ │ │ ├── ieee754@1.1.8
│ │ │ └── isarray@1.0.0
│ │ ├── crypto-browserify@1.0.9
│ │ ├── events@1.1.1
│ │ ├── jmespath@0.15.0
│ │ ├── querystring@0.2.0
│ │ ├── sax@1.2.1
│ │ ├─┬ url@0.10.3
│ │ │ └── punycode@1.3.2
│ │ ├── xml2js@0.4.17
│ │ └─┬ xmlbuilder@4.2.1
│ │ └── lodash@4.17.4
│ ├─┬ aws-xray-sdk-core@1.1.6
│ │ ├─┬ continuation-local-storage@3.2.1
│ │ │ ├─┬ async-listener@0.6.8
│ │ │ │ └── shimmer@1.2.0
│ │ │ └── emitter-listener@1.1.1
│ │ ├── moment@2.19.2
│ │ ├── pkginfo@0.4.1
│ │ ├── semver@5.4.1
│ │ ├── underscore@1.8.3
│ │ └─┬ winston@2.4.0
│ │ ├── async@1.0.0
│ │ ├── colors@1.0.3
│ │ ├── cycle@1.0.3
│ │ ├── eyes@0.1.8
│ │ ├── isstream@0.1.2
│ │ └── stack-trace@0.0.10
│ ├── dotenv@4.0.0
│ └── json-stringify-safe@5.0.1
└── uuid@3.1.0


2017-11-26T03:11:40.415Z		npm
2017-11-26T03:11:40.415Z		WARN tmp No description

2017-11-26T03:11:40.415Z		npm
2017-11-26T03:11:40.415Z		WARN
2017-11-26T03:11:40.415Z		tmp No repository field.

2017-11-26T03:11:40.415Z		npm
2017-11-26T03:11:40.416Z		WARN tmp No license field.

2017-11-26T03:11:40.497Z		total 20
-rw-rw-r-- 1 sbx_user1064 482 5120 Nov 26 03:11 autoinstall.js
drwxrwxr-x 42 sbx_user1064 482 4096 Nov 26 03:11 node_modules
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 npm-16-567280b0
-rw-rw-r-- 1 sbx_user1064 482 103 Nov 26 03:11 package.json

2017-11-26T03:11:40.498Z		total 172
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 asap
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 async
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 async-listener
drwxrwxr-x 9 sbx_user1064 482 4096 Nov 26 03:11 aws-sdk
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 aws-xray-sdk-core
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 base64-js
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 buffer
drwxrwxr-x 7 sbx_user1064 482 4096 Nov 26 03:11 colors
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 continuation-local-storage
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 crypto-browserify
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 cycle
drwxrwxr-x 5 sbx_user1064 482 4096 Nov 26 03:11 dnscache
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 dotenv
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 emitter-listener
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 events
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 eyes
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 ieee754
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 isarray
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 isstream
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 jmespath
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 json-stringify-safe
drwxrwxr-x 3 sbx_user1064 482 20480 Nov 26 03:11 lodash
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 lodash._baseclone
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 lodash.clone
drwxrwxr-x 5 sbx_user1064 482 4096 Nov 26 03:11 moment
drwxrwxr-x 5 sbx_user1064 482 4096 Nov 26 03:11 pkginfo
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 punycode
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 querystring
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 sax
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 semver
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 shimmer
drwxrwxr-x 8 sbx_user1064 482 4096 Nov 26 03:11 sigfox-aws
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 stack-trace
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 underscore
drwxrwxr-x 2 sbx_user1064 482 4096 Nov 26 03:11 url
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 uuid
drwxrwxr-x 4 sbx_user1064 482 4096 Nov 26 03:11 winston
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 xml2js
drwxrwxr-x 3 sbx_user1064 482 4096 Nov 26 03:11 xmlbuilder

2017-11-26T03:11:40.499Z		Creating /tmp/index.js
2017-11-26T03:11:40.499Z		require /tmp/index.js
2017-11-26T03:11:40.500Z		Calling handler in /tmp/index.js from /tmp/autoinstall.js...
2017-11-26T03:11:40.500Z		Creating instance of wrap function... /tmp/autoinstall.js
2017-11-26T03:11:40.778Z		AWS_XRAY_DAEMON_ADDRESS is set. Configured daemon address to 169.254.79.2:2000.
2017-11-26T03:11:40.781Z		AWS_XRAY_CONTEXT_MISSING is set. Configured context missing strategy to LOG_ERROR.
2017-11-26T03:11:40.834Z		Subsegment streaming threshold set to: 0
2017-11-26T03:11:40.836Z		Using custom sampling rules source.
2017-11-26T03:11:41.536Z		main { event: { key3: 'value3', key2: 'value2', key1: 'value1' },
context:
{ callbackWaitsForEmptyEventLoop: [Getter/Setter],
done: [Function: done],
succeed: [Function: succeed],
fail: [Function: fail],
logGroupName: '/aws/lambda/testExec',
logStreamName: '2017/11/26/[$LATEST]1737c4c280894369806c0e583ef72d40',
functionName: 'testExec',
memoryLimitInMB: '640',
functionVersion: '$LATEST',
getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
invokeid: '',
awsRequestId: '',
invokedFunctionArn: 'arn:aws:lambda:ap-southeast-1:112039193356:function:testExec',
autoinstalled: true },
callback: [Function: callback],
scloud:
{ isGoogleCloud: false,
isAWS: true,
projectId: null,
functionName: 'testExec',
sleep: [Function: sleep],
removeNulls: [Function: removeNulls],
log: [Function: log],
error: [Function: log],
flushLog: [Function: flushLog],
logQueue: [Function: logQueue],
dumpError: [Function: dumpError],
dumpNullError: [Function: dumpNullError],
createTraceID: [Function: createTraceID],
startRootSpan: [Function: startRootSpan],
publishJSON: [Function: publishJSON],
publishMessage: [Function: publishMessage],
updateMessageHistory: [Function: updateMessageHistory],
dispatchMessage: [Function: dispatchMessage],
createDevice: [Function: createDevice],
getDeviceState: [Function: getDeviceState],
updateDeviceState: [Function: updateDeviceState],
init: [Function: init],
main: [Function: main],
endTask: [Function: endTask],
logQueueConfig: [],
setLogQueue: [Function: setLogQueue],
transformRoute: [Function: transformRoute],
setRoute: [Function: setRoute],
getRootSpan: [Function: getRootSpan],
endRootSpan: [Function: endRootSpan],
createChildSpan: [Function: createChildSpan] } }
END RequestId:
REPORT RequestId: 	Duration: 20028.25 ms	Billed Duration: 20100 ms Memory Size: 640 MB	Max Memory Used: 234 MB
*/

/* Subsequent Run:
START RequestId:  Version: $LATEST
2017-11-26T03:16:46.877Z		Reusing /tmp/index.js
2017-11-26T03:16:46.877Z		require /tmp/index.js
2017-11-26T03:16:46.877Z		Calling handler in /tmp/index.js from /tmp/autoinstall.js...
2017-11-26T03:16:46.877Z		main { event: { key3: 'value3', key2: 'value2', key1: 'value1' },
context:
{ callbackWaitsForEmptyEventLoop: [Getter/Setter],
done: [Function: done],
succeed: [Function: succeed],
fail: [Function: fail],
logGroupName: '/aws/lambda/testExec',
logStreamName: '2017/11/26/[$LATEST]1737c4c280894369806c0e583ef72d40',
functionName: 'testExec',
memoryLimitInMB: '640',
functionVersion: '$LATEST',
getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
invokeid: '',
awsRequestId: '',
invokedFunctionArn: 'arn:aws:lambda:ap-southeast-1:112039193356:function:testExec',
autoinstalled: true },
callback: [Function: callback],
scloud:
{ isGoogleCloud: false,
isAWS: true,
projectId: null,
functionName: 'testExec',
sleep: [Function: sleep],
removeNulls: [Function: removeNulls],
log: [Function: log],
error: [Function: log],
flushLog: [Function: flushLog],
logQueue: [Function: logQueue],
dumpError: [Function: dumpError],
dumpNullError: [Function: dumpNullError],
createTraceID: [Function: createTraceID],
startRootSpan: [Function: startRootSpan],
publishJSON: [Function: publishJSON],
publishMessage: [Function: publishMessage],
updateMessageHistory: [Function: updateMessageHistory],
dispatchMessage: [Function: dispatchMessage],
createDevice: [Function: createDevice],
getDeviceState: [Function: getDeviceState],
updateDeviceState: [Function: updateDeviceState],
init: [Function: init],
main: [Function: main],
endTask: [Function: endTask],
logQueueConfig: [],
setLogQueue: [Function: setLogQueue],
transformRoute: [Function: transformRoute],
setRoute: [Function: setRoute],
getRootSpan: [Function: getRootSpan],
endRootSpan: [Function: endRootSpan],
createChildSpan: [Function: createChildSpan] } }
END RequestId:
REPORT RequestId: 	Duration: 15.88 ms	Billed Duration: 100 ms Memory Size: 640 MB	Max Memory Used: 234 MB
*/
