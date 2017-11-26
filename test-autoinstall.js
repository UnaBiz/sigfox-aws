/* eslint-disable camelcase,max-len,global-require,import/no-unresolved */
const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
  { "dependencies": {
    "dnscache": "^1.0.1",
    "sigfox-aws": ">=1.0.8",
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
//  region Standard Code for AutoInstall Startup Function.  Do not change.  https://github.com/UnaBiz/sigfox-aws/blob/master/autoinstall.js

/* eslint-disable camelcase,no-unused-vars,import/no-absolute-path,import/no-unresolved,no-use-before-define,global-require,max-len,no-tabs */
function autoinstall(event, context, callback) {
  //  When AWS starts our Lambda function, we load the autoinstall script from GitHub to install any NPM dependencies.
  //  For first run, install the dependencies specified in package_json and proceed to next step.
  //  For future runs, just execute the wrapper function with the event, context, callback parameters.
  const afterExec = error => error ? callback(error, 'AutoInstall Failed')
    : require('/tmp/autoinstall').installAndRunWrapper(event, context, callback,
      package_json, __filename, wrapper, wrap);
  if (require('fs').existsSync('/tmp/autoinstall.js')) return afterExec(null);  //  Already downloaded.
  const cmd = 'curl -s -S -o /tmp/autoinstall.js https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js';
  const child = require('child_process').exec(cmd, { maxBuffer: 1024 * 500 }, afterExec);
  child.stdout.on('data', console.log); child.stderr.on('data', console.error);
  return null;
}
const wrapper = {};  //  The single reused wrapper instance (initially empty) for invoking the module functions.
exports.main = isAWS ? autoinstall : null; //  exports.main is the AWS Lambda and Google Cloud Function startup function.

//  //////////////////////////////////////////////////////////////////////////////////// endregion

/* Expected Output:
START RequestId: 9951bbcd-d24b-11e7-b302-c13b259cd165 Version: $LATEST
2017-11-26T01:46:20.239Z	total 12
-rw-rw-r-- 1 sbx_user1060 486 5175 Nov 26 01:46 autoinstall.js
-rw-rw-r-- 1 sbx_user1060 486 103 Nov 26 01:46 package.json

2017-11-26T01:46:48.600Z	/tmp
├─┬ dnscache@1.0.1
│ ├── asap@2.0.6
│ └─┬ lodash.clone@4.3.2
│ └── lodash._baseclone@4.5.7
├─┬ sigfox-aws@1.0.7
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


2017-11-26T01:46:48.619Z	npm
2017-11-26T01:46:48.619Z	WARN tmp No description

2017-11-26T01:46:48.619Z	npm
2017-11-26T01:46:48.619Z	WARN
2017-11-26T01:46:48.619Z	tmp No repository field.

2017-11-26T01:46:48.619Z	npm
2017-11-26T01:46:48.620Z	WARN tmp No license field.

2017-11-26T01:46:48.699Z	total 20
-rw-rw-r-- 1 sbx_user1060 486 5175 Nov 26 01:46 autoinstall.js
drwxrwxr-x 42 sbx_user1060 486 4096 Nov 26 01:46 node_modules
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 npm-16-e021d47b
-rw-rw-r-- 1 sbx_user1060 486 103 Nov 26 01:46 package.json

2017-11-26T01:46:48.718Z	total 180
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 asap
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 async
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 async-listener
drwxrwxr-x 9 sbx_user1060 486 4096 Nov 26 01:46 aws-sdk
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 aws-xray-sdk-core
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 base64-js
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 buffer
drwxrwxr-x 7 sbx_user1060 486 4096 Nov 26 01:46 colors
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 continuation-local-storage
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 crypto-browserify
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 cycle
drwxrwxr-x 5 sbx_user1060 486 4096 Nov 26 01:46 dnscache
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 dotenv
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 emitter-listener
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 events
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 eyes
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 ieee754
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 isarray
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 isstream
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 jmespath
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 json-stringify-safe
drwxrwxr-x 3 sbx_user1060 486 24576 Nov 26 01:46 lodash
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 lodash._baseclone
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 lodash.clone
drwxrwxr-x 5 sbx_user1060 486 4096 Nov 26 01:46 moment
drwxrwxr-x 5 sbx_user1060 486 4096 Nov 26 01:46 pkginfo
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 punycode
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 querystring
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 sax
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 semver
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 shimmer
drwxrwxr-x 8 sbx_user1060 486 4096 Nov 26 01:46 sigfox-aws
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 stack-trace
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 underscore
drwxrwxr-x 2 sbx_user1060 486 4096 Nov 26 01:46 url
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 uuid
drwxrwxr-x 4 sbx_user1060 486 4096 Nov 26 01:46 winston
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 xml2js
drwxrwxr-x 3 sbx_user1060 486 4096 Nov 26 01:46 xmlbuilder

Creating /tmp/index.js
require /tmp/index.js
Calling handler...
Creating instance of wrap function...
main { event: { key3: 'value3', key2: 'value2', key1: 'value1' },
context:
{ callbackWaitsForEmptyEventLoop: [Getter/Setter],
done: [Function: done],
succeed: [Function: succeed],
fail: [Function: fail],
logGroupName: '/aws/lambda/testExec',
logStreamName: '2017/11/26/[$LATEST]0ffb889563d14ffc8b894aeb5f3750b9',
functionName: 'testExec',
memoryLimitInMB: '448',
functionVersion: '$LATEST',
getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
invokeid: '9951bbcd-d24b-11e7-b302-c13b259cd165',
awsRequestId: '9951bbcd-d24b-11e7-b302-c13b259cd165',
invokedFunctionArn: 'arn:aws:lambda:ap-southeast-1:112039193356:function:testExec',
wrapVar: { main: [Function: main] },
wrapFunc: [Function: wrap],
autoinstalled: true },
callback: [Function: callback] }
END RequestId: 9951bbcd-d24b-11e7-b302-c13b259cd165
REPORT RequestId: 9951bbcd-d24b-11e7-b302-c13b259cd165	Duration: 29026.45 ms	Billed Duration: 29100 ms Memory Size: 448 MB	Max Memory Used: 225 MB
*/

/* Subsequent Run:
main { event: { key3: 'value3', key2: 'value2', key1: 'value1' },
context:
{ callbackWaitsForEmptyEventLoop: [Getter/Setter],
done: [Function: done],
succeed: [Function: succeed],
fail: [Function: fail],
logGroupName: '/aws/lambda/testExec',
logStreamName: '2017/11/26/[$LATEST]0ffb889563d14ffc8b894aeb5f3750b9',
functionName: 'testExec',
memoryLimitInMB: '448',
functionVersion: '$LATEST',
getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
invokeid: '3d980664-d24c-11e7-9152-2fc4c4c41b37',
awsRequestId: '3d980664-d24c-11e7-9152-2fc4c4c41b37',
invokedFunctionArn: 'arn:aws:lambda:ap-southeast-1:112039193356:function:testExec',
wrapVar: { main: [Function: main] },
wrapFunc: [Function: wrap] },
callback: [Function: callback] }
END RequestId: 3d980664-d24c-11e7-9152-2fc4c4c41b37
REPORT RequestId: 3d980664-d24c-11e7-9152-2fc4c4c41b37	Duration: 14.36 ms	Billed Duration: 100 ms Memory Size: 448 MB	Max Memory Used: 225 MB
*/
