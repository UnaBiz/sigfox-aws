/* eslint-disable global-require,camelcase,import/no-dynamic-require,no-console */
//  This script allows you to use require(...) for NPM modules in AWS Lambda Functions,
//  without preinstalling or bundling the dependencies in advance.  The AWS Lambda Function
//  should call the install() function passing a package.json that lists the
//  NPM modules to be installed.  The NPM modules will be installed in /tmp/node_modules.
//  This is meant to replicate the auto NPM install feature in Google Cloud.
//  This is not as fast as preinstalling and bundling the dependencies,
//  but it's easier to maintain and faster to prototype.  The first call
//  is slower because it loads the dependencies, but subsequent calls will
//  be faster because AWS reuses the dependencies until it spawns another Lambda instance.

const exec = require('child_process').exec;
const fs = require('fs');

const tmp = '/tmp';  //  Relocate code here.
const sourceFilename = 'index.js';
const packageFilename = 'package.json';
const installedSourceFilename = `${tmp}/${sourceFilename}`;
const installedPackageFilename = `${tmp}/${packageFilename}`;

function reloadLambda(event, context, callback) {
  //  Load the relocated Lambda Function at /tmp/index.js and call it.
  console.log('require', installedSourceFilename);
  const installedModule = require(installedSourceFilename);
  console.log('Calling handler...');
  if (installedModule.handler) return installedModule.handler(event, context, callback);
  if (installedModule.main) return installedModule.main(event, context, callback);
  throw new Error('Handler not found - should be named "handler" or "main"');
}

function install(package_json, event, context, callback, sourceCode) {
  //  Copy the specified source code to /tmp/index.js. Write package_json to /tmp/package.json.
  //  Then run "npm install" to install dependencies from package.json.
  //  Finally reload /tmp/index.js and continue execution from the handler.
  //  This is not as fast as preinstalling and bundling the dependencies,
  //  but it's easier to maintain and faster to prototype.

  //  If package.json and source code file both exist in /tmp, then assume already installed.
  if (fs.existsSync(installedPackageFilename) && fs.existsSync(installedSourceFilename)) {
    console.log('Reusing', installedSourceFilename);
    return reloadLambda(event, context, callback);
  }
  //  Write the provided package.json and call "npm install".
  fs.writeFileSync(installedPackageFilename, JSON.stringify(package_json, null, 2));
  const cmd = `export HOME=${tmp}; cd ${tmp}; ls -l; npm install; ls -l; ls -l node_modules; `;
  const child = exec(cmd, { maxBuffer: 1024 * 500 }, (error) => {
    //  NPM command failed.
    if (error) return callback(error, 'AutoInstall Failed');
    //  Write the source code file to indicate that we have succeeded.
    console.log('Creating', installedSourceFilename);
    fs.writeFileSync(installedSourceFilename, sourceCode);
    //  Load the relocated source file at /tmp/index.js and call it.
    return reloadLambda(event, context, callback);
  });
  // Log process stdout and stderr
  child.stdout.on('data', console.log);
  child.stderr.on('data', console.error);
  return null;
}

/* function dependenciesInstalled(event) {
  //  Return true if dependencies are already installed.
  if (event.unittest) return true;  //  Unit test.
  if (__filename.indexOf('/tmp') === 0) return true;
  return false;
} */

function installAndRunWrapper(event, context, callback, package_json, sourceFile,
  wrapVar, wrapFunc) {
  //  Copy the specified Lamba function source file to /tmp/index.js.
  //  Write package_json to /tmp/package.json.
  //  Then run "npm install" to install dependencies from package.json.
  //  Then reload /tmp/index.js, create an instance of the wrap()
  //  function, save into wrapVar and call wrap().main(event, context, callback)

  //  Read the source code of the Lambda function so that we may
  //  relocate it to /tmp and call it after installing dependencies.
  const sourceCode = fs.readFileSync(sourceFile);
  //  Install the dependencies in package_json.
  install(package_json, event, context, callback, sourceCode);
  //  If wrapper not created yet, create it with the wrap function.
  //  eslint-disable-next-line no-param-reassign
  if (!wrapVar.main) wrapVar = wrapFunc(package_json);
  return wrapVar.main.bind(wrapVar)(event, context, callback);
}

module.exports = {
  install,
  installAndRunWrapper,
};
