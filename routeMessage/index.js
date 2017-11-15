//  routeMessage Installation Instructions:
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: routeMessage
//  Runtime: Node.js 6.10
//  Memory: 512 MB
//  Timeout: 1 min
//  Existing Role: lambda_iot (defined according to ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: Enable active tracing
//  Environment Variables:
//  NODE_ENV=production
//  SIGFOX_ROUTE=decodeStructuredMessage,sendToUbidots,sendToDatabase

//  Go to AWS IoT, create a Rule:
//  Name: sigfoxRouteMessage
//  SQL Version: Beta
//  Attribute: *
//  Topic filter: sigfox/received
//  Condition: (Blank)
//  Action: Run Lambda Function routeMessage

//  Lambda Function routeMessage is triggered when a Sigfox message is sent
//  to sigfox.received, the queue for all received messages.
//  We set the Sigfox message route according to the device ID.
//  The route is stored in the SigfoxConfig AWS IoT device attributes.

//  Try not to call any database that may cause this function to fail
//  under heavy load.  High availability of this Cloud Function is
//  essential in order to route every Sigfox message properly.

/* eslint-disable max-len, camelcase, no-console, no-nested-ternary, import/no-dynamic-require,import/newline-after-import, import/no-unresolved, global-require  */
process.on('uncaughtException', err => console.error(err.message, err.stack));  //  Display uncaught exceptions.
process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection at:', p, 'reason:', reason));

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AutoInstall: List all dependencies here, or just paste the contents of package.json. Autoinstall will install these dependencies.

const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
    {
      "name": "routeMessage",
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
        "sigfox-aws": ">=0.0.24",
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
//  PASTE PACKAGE.JSON ABOVE  //////////////////////////////////////////////////////////
; /* eslint-enable quote-props,quotes,comma-dangle,indent */

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AWS-Specific Functions

if (!process.env.SIGFOX_ROUTE) throw new Error('Environment variable SIGFOX_ROUTE must be defined');

const awsmetadata = { // eslint-disable-next-line no-unused-vars
  authorize: req => Promise.resolve({}),
  //  TODO: Get from SigfoxConfig
  getProjectMetadata: (/* req, authClient */) => Promise.resolve({ 'sigfox-route': process.env.SIGFOX_ROUTE }),
  convertMetadata: (req, metadata) => Promise.resolve(metadata),
};

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AWS Lambda Startup

// eslint-disable-next-line arrow-body-style
exports.handler = (event, context, callback) => {
  console.log(JSON.stringify({ event, env: process.env }, null, 2));

  //  Install the dependencies from package_json above.  Will reload the script.
  //  eslint-disable-next-line no-use-before-define
  return autoInstall(package_json, event, context, callback)
    .then((installed) => {
      if (!installed) return null;  //  Dependencies installing now.  Wait until this Lambda reloads.

      //  Dependencies loaded, so we can use require here.
      //  Call the main function to handle the event.
      //  eslint-disable-next-line no-use-before-define
      return main(event)
        .then(result => callback(null, result))
        .catch(error => callback(error, null));
    })
    .catch(error => callback(error, null));
};

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Declarations for Google Cloud and AWS

//  A route is an array of strings.  Each string indicates the next processing step,
//  e.g. ['decodeStructuredMessage', 'logToGoogleSheets'].

//  The route is stored in this key in the Google Cloud Metadata store.
const defaultRouteKey = 'sigfox-route';
const routeExpiry = 10 * 1000;  //  Routes expire in 10 seconds.

let defaultRoute = null;        //  The cached route.
let defaultRouteExpiry = null;  //  Cache expiry timestamp.

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Code for Google Cloud and AWS

function wrap() {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.

  require('dnscache')({ enable: true });  //  Enable DNS cache in case we hit the DNS quota
  const scloud = require('sigfox-aws'); //  sigfox-aws Framework
  const stringify = require('json-stringify-safe');

  function getRoute(req) {
    //  Fetch the route from the Google Cloud Metadata store, which is easier
    //  to edit.  Previously we used a hardcoded route.
    //  Refresh the route every 10 seconds in case it has been updated.
    //  Returns a promise.

    //  Return the cached route if not expired.
    if (defaultRoute && defaultRouteExpiry >= Date.now()) return Promise.resolve(defaultRoute);
    //  Extend the expiry temporarily so we don't have 2 concurrent requests to fetch the route.
    if (defaultRoute) defaultRouteExpiry = Date.now() + routeExpiry;
    let authClient = null;
    let metadata = null;
    //  Get a Google auth client.
    return awsmetadata.authorize(req)
      .then((res) => { authClient = res; })
      //  Get the project metadata.
      .then(() => awsmetadata.getProjectMetadata(req, authClient))
      .then((res) => { metadata = res; })
      //  Convert the metadata to a JavaScript object.
      .then(() => awsmetadata.convertMetadata(req, metadata))
      //  Return the default route from the metadata.
      .then(metadataObj => metadataObj[defaultRouteKey])
      .then((res) => {
        //  Cache for 10 seconds.
        //  result looks like 'decodeStructuredMessage,logToGoogleSheets'
        //  Convert to ['decodeStructuredMessage', 'logToGoogleSheets']
        const result = res.split(' ').join('').split(',');  //  Remove spaces.
        //  Last route is always "all".
        if (result.indexOf('all') < 0) result.push('all');
        defaultRoute = result;
        defaultRouteExpiry = Date.now() + routeExpiry;
        scloud.log(req, 'getRoute', { result, device: req.device });
        return result;
      })
      .catch((error) => {
        scloud.log(req, 'getRoute', { error, device: req.device });
        //  In case of error, reuse the previous route if any.
        if (defaultRoute) return defaultRoute;
        throw error;
      });
  }

  //  TODO: Fetch route upon startup.  In case of error, try later.
  // setTimeout(() =>
  //  getRoute({}).catch(() => 'OK'),
  //  1000);  //  Must wait 1 second or will hit network errors.

  function routeMessage(req, device, body, msg0) {
    //  Set the message route according to the map and device ID.
    //  message = { device, type, body, query }
    //  Returns a promise.
    const msg = Object.assign({}, msg0);
    return getRoute(req)
      .then((route) => {
        //  Must clone the route because it might be mutated accidentally.
        msg.route = JSON.parse(stringify(route || []));
        const result = msg;
        scloud.log(req, 'routeMessage', { result, route, device, body, msg });
        return result;
      })
      .catch((error) => {
        scloud.log(req, 'routeMessage', { error, device, body, msg });
        throw error;
      });
  }

  function task(req, device, body, msg) {
    //  The task for this Google Cloud Function:
    //  Set the route for the Sigfox message depending on device ID.
    //  The route is saved into the "route" field of the Sigfox message.
    return routeMessage(req, device, body, msg)
      .catch((error) => {
        scloud.log(req, 'task', { error, device, body, msg });
        throw error;
      });
  }

  return {
    //  Expose these functions outside of the wrapper.
    //  When this Google Cloud Function is triggered, we call main() which calls task().
    serveQueue: event => scloud.main(event, task),
  };
}

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Main Function

function main(event) {
  //  Create a wrapper and serve the PubSub event.
  let wrapper = wrap();
  return wrapper.serveQueue(event)
  //  Dispose the wrapper and all resources inside.
    .then((result) => { wrapper = null; return result; })
    //  Suppress the error or Cloud will call the function again.
    .catch((error) => { wrapper = null; return error; });
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
