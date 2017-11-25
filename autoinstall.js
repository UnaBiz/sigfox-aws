/* eslint-disable global-require,camelcase,import/no-dynamic-require */
//  This script allows you to use require(...) for NPM modules in AWS Lambda Functions,
//  without preinstalling or bundling the dependencies in advance.  The AWS Lambda Function
//  should call the install() function passing a package.json that lists the
//  NPM modules to be installed.  The NPM modules will be installed in /tmp/node_modules.
//  This is meant to replicate the auto NPM install feature in Google Cloud.
//  This is not as fast as preinstalling and bundling the dependencies,
//  but it's easier to maintain and faster to prototype.

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

function run(package_json, event, context, callback, sourceFile,
  wrapVar, wrapFunc) {
  //  wrapVar={}
  //  eslint-disable-next-line no-param-reassign
  if (!wrapVar.main) wrapVar = wrapFunc(package_json);  //  Already installed or in unit test.
  return wrapVar.main.bind(wrapVar)(event, context, callback);  //  Run the wrapper.
}

module.exports = {
  install,
};
