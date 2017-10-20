//  This script allows you to use require(...) for NPM modules in AWS Lambda Functions,
//  without preinstalling or bundling the dependencies in advance.
//  The AWS Lambda Function should provide a package.json that lists the 
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

function install(package_json, event, context, callback, sourceCode) {
    //  Copy the specified source code to /tmp/index.js. Write package_json to /tmp/package.json.
    //  Then run "npm install" to install dependencies from package.json.
    //  Finally reload /tmp/index.js and continue execution from the handler.
    //  This is not as fast as preinstalling and bundling the dependencies,
    //  but it's easier to maintain and faster to prototype.
    fs.writeFileSync(installedSourceFilename, sourceCode);
    fs.writeFileSync(installedPackageFilename, JSON.stringify(package_json, null, 2));
    const cmd = `export HOME=${tmp}; cd ${tmp}; ls -l; npm install; ls -l; ls -l node_modules; `;
    
    const child = exec(cmd, {maxBuffer: 1024 * 500}, (error) => {
        // Resolve with result of process
        if (error) return callback(error, 'Error');
        console.log('require', installedSourceFilename);
        const installedModule = require(installedSourceFilename);
        console.log('Calling handler...');
        return installedModule.handler(event, context, callback);
    });

    // Log process stdout and stderr
    child.stdout.on('data', console.log);
    child.stderr.on('data', console.error);
}

module.exports = {
    install,
};
