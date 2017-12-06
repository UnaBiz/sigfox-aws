//  processIoTLogs Installation Instructions:
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: processIoTLogs
//  Runtime: Node.js 6.10
//  Handler: index.main
//  Memory: 512 MB
//  Timeout: 5 min
//  Existing Role: lambda_iot Role, which has the LambdaExecuteIoTUpdate Policy
//    (defined in ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: Enable active tracing
//  Environment Variables:
//    NODE_ENV=production
//    AUTOINSTALL_DEPENDENCY=sigfox-aws/decodeStructuredMessage

//  TODO: CloudWatch config

/* eslint-disable max-len, camelcase, no-console, no-nested-ternary, import/no-dynamic-require, import/newline-after-import, import/no-unresolved, global-require */

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

function wrap(scloud) {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.
  //  eslint-disable-next-line import/no-extraneous-dependencies
  //  const scloud = require('sigfox-aws'); //  sigfox-aws Framework
  let wrapCount = 0;  //  Count how many times the wrapper has been reused.

  function parseLine(req, line) {
    return line;
  }

  function task(req, device, body0, msg) {
    //  The task for this Cloud Function: Parse the AWS IoT Log in CloudWatch format that is passed in as the
    //  parameter. Watch for any IoT Rules and Lambda Functions executed.  If detected, fetch the AWS XRay
    //  segment from AWS S3 storage and open/close the segments.
    wrapCount += 1; console.log({ wrapCount });  //  Count how many times the wrapper has been reused.
    return Promise.resolve('OK')
      .then(() => msg)
      .catch((error) => { throw error; });
  }

  //  Unit Test
  if (process.env.NODE_ENV !== 'production') return { task, parseLine };

  //  Expose these functions outside of the wrapper.
  //  When this Cloud Function is triggered, we call main() which calls task().
  return { task };
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
