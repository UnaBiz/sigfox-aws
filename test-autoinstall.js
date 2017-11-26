/* eslint-disable camelcase,no-unused-vars,import/no-absolute-path,import/no-unresolved,no-use-before-define,global-require,max-len */
const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
  { "dependencies": {
    "dnscache": "^1.0.1",
    "sigfox-aws": ">=1.0.6",
    "uuid": "^3.1.0" } };

const isGoogleCloud = !!process.env.FUNCTION_NAME || !!process.env.GAE_SERVICE;
const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

function autoinstall(event, context, callback) {
  const afterExec = error => error ? callback(error, 'AutoInstall Failed')
    : require('/tmp/autoinstall').installAndRunWrapper(event, context, callback,
      package_json, __filename, wrapper, wrap);
  if (require('fs').existsSync('/tmp/autoinstall.js')) return afterExec(null);  //  Already downloaded.
  const cmd = 'curl -s -S -o /tmp/autoinstall.js https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js';
  const child = require('child_process').exec(cmd, { maxBuffer: 1024 * 500 }, afterExec);
  child.stdout.on('data', console.log); child.stderr.on('data', console.error);
  return null;
}
exports.main = isAWS ? autoinstall : null;
const wrapper = {};
function wrap() {
  function main(event, context, callback) {
    console.log('main', { event, context, callback });
    return callback(null, 'OK');
  }
  return { main };
}

/* Expected Output:
*/

