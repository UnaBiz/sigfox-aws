//  decodeStructuredMessage Installation Instructions:
//  Copy and paste the entire contents of this file into a Lambda Function
//  Name: decodeStructuredMessage
//  Runtime: Node.js 6.10
//  Memory: 512 MB
//  Timeout: 1 min
//  Existing Role: lambda_iot (defined according to ../policy/LambdaExecuteIoTUpdate.json)
//  Debugging: Enable active tracing
//  Environment Variables: NODE_ENV=production

//  Go to AWS IoT, create a Rule:
//  Name: sigfoxDecodeStructuredMessage
//  SQL Version: Beta
//  Attribute: *
//  Topic filter: sigfox/types/decodeStructuredMessage
//  Condition: (Blank)
//  Action: Run Lambda Function decodeStructuredMessage

//  Lambda Function decodeStructuredMessage is triggered when a
//  Sigfox message is sent to the message queue
//  sigfox.types.decodeStructuredMessage.
//  We decode the structured sensor data inside the Sigfox message,
//  sent by unabiz-arduino library, containing field names and values.

//  See this for the definition of structured messages:
//  https://github.com/UnaBiz/unabiz-arduino/wiki/UnaShield

/* eslint-disable max-len, camelcase, no-console, no-nested-ternary, import/no-dynamic-require, import/newline-after-import, import/no-unresolved, global-require */
process.on('uncaughtException', err => console.error(err.message, err.stack));  //  Display uncaught exceptions.
process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection at:', p, 'reason:', reason));

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region AutoInstall: List all dependencies here, or just paste the contents of package.json. Autoinstall will install these dependencies.

const package_json = /* eslint-disable quote-props,quotes,comma-dangle,indent */
//  PASTE PACKAGE.JSON BELOW  //////////////////////////////////////////////////////////
    {
      "name": "decodeStructuredMessage",
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
        "sigfox-aws": ">=0.0.33",
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

//  TODO: Move this into NPM.
const structuredMessageModule = `
//  Decode the structured message sent by unabiz-arduino library.

const firstLetter = 1;  //  Letters are assigned codes 1 to 26, for A to Z
const firstDigit = 27;  //  Digits are assigned codes 27 to 36, for 0 to 9

function decodeLetter(code) {
  //  Convert the 5-bit code to a letter.
  if (code === 0) return 0;
  if (code >= firstLetter && code < firstDigit) return (code - firstLetter) + 'a'.charCodeAt(0);
  if (code >= firstDigit) return (code - firstDigit) + '0'.charCodeAt(0);
  return 0;
}

function decodeText(encodedText0) { /* eslint-disable no-bitwise, operator-assignment */
  //  Decode a text string with packed 5-bit letters.
  let encodedText = encodedText0;
  const text = [0, 0, 0];
  for (let j = 0; j < 3; j = j + 1) {
    const code = encodedText & 31;
    const ch = decodeLetter(code);
    if (ch > 0) text[2 - j] = ch;
    encodedText = encodedText >> 5;
  }
  //  Look for the terminating null and decode name with 1, 2 or 3 letters.
  //  Skip invalid chars.
  return [
    (text[0] >= 48 && text[0] <= 122) ? String.fromCharCode(text[0]) : '',
    (text[1] >= 48 && text[1] <= 122) ? String.fromCharCode(text[1]) : '',
    (text[2] >= 48 && text[2] <= 122) ? String.fromCharCode(text[2]) : '',
  ].join('');
} /* eslint-enable no-bitwise, operator-assignment */

function decodeMessage(data, textFields) { /* eslint-disable no-bitwise, operator-assignment */
  //  Decode the packed binary SIGFOX message body data e.g. 920e5a00b051680194597b00
  //  2 bytes name, 2 bytes float * 10, 2 bytes name, 2 bytes float * 10, ...
  //  Returns an object with the decoded data e.g. {ctr: 999, lig: 754, tmp: 23}
  //  If the message contains text fields, provide the field names in textFields as an array,
  //  e.g. ['d1', 'd2, 'd3'].
  if (!data) return {};
  //  Messages must be either 8, 16 or 24 chars (4, 8 or 12 bytes).
  if (data.length !== 8 && data.length !== 16 && data.length !== 24) return {};
  try {
    const result = {};
    for (let i = 0; i < data.length; i = i + 8) {
      const name = data.substring(i, i + 4);
      const val = data.substring(i + 4, i + 8);
      const encodedName =
        (parseInt(name[2], 16) << 12) +
        (parseInt(name[3], 16) << 8) +
        (parseInt(name[0], 16) << 4) +
        parseInt(name[1], 16);
      const encodedVal =
        (parseInt(val[2], 16) << 12) +
        (parseInt(val[3], 16) << 8) +
        (parseInt(val[0], 16) << 4) +
        parseInt(val[1], 16);

      //  Decode name.
      const decodedName = decodeText(encodedName);
      if (textFields && textFields.indexOf(decodedName) >= 0) {
        //  Decode the text field.
        result[decodedName] = decodeText(encodedVal);
      } else {
        //  Decode the number.
        result[decodedName] = encodedVal / 10.0;
      }
    }
    return result;
  } catch (error) {
    throw error;
  }
} /* eslint-enable no-bitwise, operator-assignment */

module.exports = {
  decodeMessage,
};
`;
require('fs').writeFileSync('/tmp/structuredMessage.js', structuredMessageModule);

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

//  //////////////////////////////////////////////////////////////////////////////////// endregion
//  region Portable Code for Google Cloud and AWS

function wrap() {
  //  Wrap the module into a function so that all we defer loading of dependencies,
  //  and ensure that cloud resources are properly disposed.

  require('dnscache')({ enable: true });  //  Enable DNS cache in case we hit the DNS quota
  const scloud = require('sigfox-aws'); //  sigfox-aws Framework
  //  TODO: const structuredMessage = require('./structuredMessage');
  //  eslint-disable-next-line import/no-absolute-path
  const structuredMessage = require('/tmp/structuredMessage');

  function decodeMessage(req, body) {
    //  Decode the packed binary SIGFOX message body data e.g. 920e5a00b051680194597b00
    //  2 bytes name, 2 bytes float * 10, 2 bytes name, 2 bytes float * 10, ...
    //  Returns a promise for the updated body.  If no body available, return {}.
    if (!body || !body.data) return Promise.resolve(Object.assign({}, body));
    try {
      const decodedData = structuredMessage.decodeMessage(body.data);
      const result = Object.assign({}, body, decodedData);
      scloud.log(req, 'decodeMessage', { result, body, device: req.device });
      return Promise.resolve(result);
    } catch (error) {
      //  In case of error, return the original message.
      scloud.log(req, 'decodeMessage', { error, body, device: req.device });
      return Promise.resolve(body);
    }
  }

  function task(req, device, body, msg) {
    //  The task for this Google Cloud Function:
    //  Decode the structured body in the Sigfox message.
    //  This adds additional fields to the message body,
    //  e.g. ctr (counter), lig (light level), tmp (temperature).
    return decodeMessage(req, body)
    //  Return the message with the body updated.
      .then(updatedBody => Object.assign({}, msg, { body: updatedBody, device: req.device }))
      .catch((error) => { throw error; });
  }

  return {
    //  Expose these functions outside of the wrapper.
    //  When this Google Cloud Function is triggered, we call main() which calls task().
    serveQueue: event => scloud.main(event, task),

    //  For unit test only.
    task,
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
