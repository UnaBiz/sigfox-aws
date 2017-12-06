//  This sigfox-aws module remembers and computes the sum of last 10 "tmp" sensor values
//  for each device.  Used for time series computation.
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

function wrap() {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.
  const scloud = require('sigfox-aws'); //  sigfox-aws Framework
  let wrapCount = 0;  //  Count how many times the wrapper has been reused.

  function task(req, device, body0, msg) {
    //  The task for this Cloud Function:
    //  Look for any "tmp" values in the Sigfox message.
    //  Accumulate the last 10 values in a SigfoxAggregator Thing.
    //  Sum up the last 10 values and set as "tmpsum" in the Sigfox message.
    //  We use a Thing to aggregate because it's much faster than database
    //  or file storage.  It must aggregate a message within 10 seconds or data
    //  will be lost.
    wrapCount += 1; console.log({ wrapCount });  //  Count how many times the wrapper has been reused.
    const body = Object.assign({}, body0);  //  Clone the message body before update.
    let state = {};
    let pastValues = [];
    //  If this Sigfox message has no "tmp" to aggregate, quit.
    if (body.tmp === null || body.tmp === undefined) return Promise.resolve(msg);
    //  Create the SigfoxAggregator Thing if not created.
    return scloud.createDevice(req, 'SigfoxAggregator')
    //  Read the last 10 "tmp" values from SigfoxAggregator by device ID.
      .then(() => scloud.getDeviceState(req, 'SigfoxAggregator')
      //  In case the device state doesn't exist, return empty state and proceed.
        .catch(() => {}))
      //  result contains {"reported":{"1A2345":[1,2,3],...
      .then((res) => {
        if (res) state = res.reported;
        //  pastValues will contain the last 10 values e.g. [1,2,3]
        if (state && state[device]) pastValues = state[device];
        //  Append the current value to the last 10 values. Latest value at the end.
        pastValues.push(body.tmp);
        //  Remove the oldest value (at the front) if we exceed 10 values.
        if (pastValues.length > 10) pastValues.shift();
        //  Set the sum of the 10 values into the Sigfox message as tmpsum.
        body.tmpsum = pastValues.reduce(  //  Compute the sum of pastValues using reduce function.
          (sum, val) => (sum + val),  //  For every value found in pastValues, add to sum.
          0  //  Initial value of the sum is 0.
        );
        //  Save the 10 values to SigfoxAggregator.
        const newState = {};
        //  This contains the partial state: {"1A2345":[1,2,3,4]}
        newState[device] = pastValues;
        console.log('Device', device, 'has accumulated', pastValues, 'with sum', body.tmpsum);
        return scloud.updateDeviceState(req, 'SigfoxAggregator', newState);
      })
      //  Return the message with the body updated.
      .then(() => Object.assign({}, msg, { body }))
      .catch((error) => { throw error; });
  }

  //  Expose these functions outside of the wrapper.
  //  When this Cloud Function is triggered, we call main() which calls task().
  return { task };
}

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
