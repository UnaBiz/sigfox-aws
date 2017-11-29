//  region Introduction
//  sigfoxCallback Installation Instructions:
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: sigfoxCallback
//  Runtime: Node.js 6.10
//  Handler: index.main
//  Memory: 512 MB
//  Timeout: 1 min
//  Existing Role: lambda_iot Role, which has the LambdaExecuteIoTUpdate Policy
//    (defined in ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: Enable active tracing
//  Environment Variables:
//    NODE_ENV=production
//    AUTOINSTALL_DEPENDENCY=sigfox-iot-cloud/sigfoxCallback

//  Create an API Gateway named sigfoxGateway (New API, Edge optimised)
//  In the sigfoxCallback configuration, add a trigger from sigfoxGateway
//  API Name: sigfoxGateway
//  Deployment Stage: prod
//  Security: Open
//  Method: ANY
//  Resource path: /sigfoxCallback
//  Authorization: NONE

//  Invoke URL should look like:
//  https://8xcb9t7mpj.execute-api.ap-southeast-1.amazonaws.com/prod/sigfoxCallback
//  For testing: See ./test/testEvent.json for test event.
//  The "time" field should be set to number of seconds
//  since 1970 Jan 1 UTC (e.g. 1511614827).  Use Chrome console to compute: Date.now() / 1000

//  We set the wrap function and package_json to null indicate that AutoInstall
//  should install the dependency from environment variable AUTOINSTALL_DEPENDENCY (see above).
const wrap = null; // eslint-disable-next-line camelcase
const package_json = null;

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
