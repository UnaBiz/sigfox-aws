'use strict';

//  List all dependencies here, or just paste the contents of package.json.  
//  Autoinstall will install these dependencies.
const package_json = {
  "name": "autoinstall",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "knex": "^0.13.0",
    "mysql": "^2.15.0"
  }
};

exports.handler = (event, context, callback) => {
    //  Install the dependencies from package_json above.  Will reload the script.
    return autoInstall(package_json, event, context, callback)
    .then((installed) => {
        if (!installed) return null;  //  Dependencies installing now.
        
        //  Dependencies loaded, so we can use require here.
        console.log('require knex');
        const knex = require("knex");
        console.log('knex.VERSION=', knex.VERSION);
        return callback(null, 'Complete! ' + __filename);
    })
    .catch((error) => callback(error));
};

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
        require('https').get('https://raw.githubusercontent.com/UnaBiz/sigfox-aws/master/autoinstall.js?random=' + Date.now(), res => {
            let body = '';  
            res.on('data', chunk => body += chunk); // Accumulate the data chunks.
            res.on('end', () => { //  After downloading from GitHub, save to /tmp amd load the module.
                require('fs').writeFileSync('/tmp/autoinstall.js', body); 
                return resolve(require('/tmp/autoinstall')); }) })
                .on('error', err => { autoinstallPromise = null; console.error('setupAutoInstall failed', err.message, err.stack); return reject(err); }); });
    return autoinstallPromise
    .then(mod => mod.install(package_json0, event0, context0, callback0, sourceCode))
    .then(() => false)
    .catch(error => { throw error; });
}

/* Expected Output:

START RequestId: b76f309c-b5cd-11e7-b46f-4908306acb03 Version: $LATEST
2017-10-20T19:34:41.738Z	b76f309c-b5cd-11e7-b46f-4908306acb03	total 12
-rw-rw-r-- 1 sbx_user1061 485 2108 Oct 20 19:34 autoinstall.js
-rw-rw-r-- 1 sbx_user1061 485 2501 Oct 20 19:34 index.js
-rw-rw-r-- 1 sbx_user1061 485 142 Oct 20 19:34 package.json

2017-10-20T19:35:13.339Z	b76f309c-b5cd-11e7-b46f-4908306acb03	autoinstall@1.0.0 /tmp
├─┬ knex@0.13.0 
│ ├─┬ babel-runtime@6.26.0 
│ │ ├── core-js@2.5.1 
│ │ └── regenerator-runtime@0.11.0 
│ ├── bluebird@3.5.1 
│ ├─┬ chalk@1.1.3 
│ │ ├── ansi-styles@2.2.1 
│ │ ├── escape-string-regexp@1.0.5 
│ │ ├─┬ has-ansi@2.0.0 
│ │ │ └── ansi-regex@2.1.1 
│ │ ├── strip-ansi@3.0.1 
│ │ └── supports-color@2.0.0 
│ ├── commander@2.11.0 
│ ├─┬ debug@2.6.9 
│ │ └── ms@2.0.0 
│ ├── generic-pool@2.5.4 
│ ├── inherits@2.0.3 
│ ├── interpret@0.6.6 
│ ├─┬ liftoff@2.2.5 
│ │ ├── extend@3.0.1 
│ │ ├─┬ findup-sync@0.4.3 
│ │ │ ├─┬ detect-file@0.1.0 
│ │ │ │ └── fs-exists-sync@0.1.0 
│ │ │ ├─┬ is-glob@2.0.1 
│ │ │ │ └── is-extglob@1.0.0 
│ │ │ ├─┬ micromatch@2.3.11 
│ │ │ │ ├─┬ arr-diff@2.0.0 
│ │ │ │ │ └── arr-flatten@1.1.0 
│ │ │ │ ├── array-unique@0.2.1 
│ │ │ │ ├─┬ braces@1.8.5 
│ │ │ │ │ ├─┬ expand-range@1.8.2 
│ │ │ │ │ │ └─┬ fill-range@2.2.3 
│ │ │ │ │ │ ├── is-number@2.1.0 
│ │ │ │ │ │ ├── isobject@2.1.0 
│ │ │ │ │ │ ├─┬ randomatic@1.1.7 
│ │ │ │ │ │ │ ├─┬ is-number@3.0.0 
│ │ │ │ │ │ │ │ └── kind-of@3.2.2 
│ │ │ │ │ │ │ └── kind-of@4.0.0 
│ │ │ │ │ │ └── repeat-string@1.6.1 
│ │ │ │ │ ├── preserve@0.2.0 
│ │ │ │ │ └── repeat-element@1.1.2 
│ │ │ │ ├─┬ expand-brackets@0.1.5 
│ │ │ │ │ └── is-posix-bracket@0.1.1 
│ │ │ │ ├── extglob@0.3.2 
│ │ │ │ ├── filename-regex@2.0.1 
│ │ │ │ ├─┬ kind-of@3.2.2 
│ │ │ │ │ └── is-buffer@1.1.5 
│ │ │ │ ├─┬ normalize-path@2.1.1 
│ │ │ │ │ └── remove-trailing-separator@1.1.0 
│ │ │ │ ├─┬ object.omit@2.0.1 
│ │ │ │ │ ├─┬ for-own@0.1.5 
│ │ │ │ │ │ └── for-in@1.0.2 
│ │ │ │ │ └── is-extendable@0.1.1 
│ │ │ │ ├─┬ parse-glob@3.0.4 
│ │ │ │ │ ├─┬ glob-base@0.3.0 
│ │ │ │ │ │ └── glob-parent@2.0.0 
│ │ │ │ │ └── is-dotfile@1.0.3 
│ │ │ │ └─┬ regex-cache@0.4.4 
│ │ │ │ └─┬ is-equal-shallow@0.1.3 
│ │ │ │ └── is-primitive@2.0.0 
│ │ │ └─┬ resolve-dir@0.1.1 
│ │ │ ├─┬ expand-tilde@1.2.2 
│ │ │ │ └── os-homedir@1.0.2 
│ │ │ └─┬ global-modules@0.2.3 
│ │ │ ├─┬ global-prefix@0.1.5 
│ │ │ │ ├─┬ homedir-polyfill@1.0.1 
│ │ │ │ │ └── parse-passwd@1.0.0 
│ │ │ │ ├── ini@1.3.4 
│ │ │ │ └─┬ which@1.3.0 
│ │ │ │ └── isexe@2.0.0 
│ │ │ └── is-windows@0.2.0 
│ │ ├── flagged-respawn@0.3.2 
│ │ ├── rechoir@0.6.2 
│ │ └─┬ resolve@1.4.0 
│ │ └── path-parse@1.0.5 
│ ├── lodash@4.17.4 
│ ├── minimist@1.1.3 
│ ├─┬ mkdirp@0.5.1 
│ │ └── minimist@0.0.8 
│ ├── pg-connection-string@0.1.3 
│ ├─┬ readable-stream@1.1.14 
│ │ ├── core-util-is@1.0.2 
│ │ ├── isarray@0.0.1 
│ │ └── string_decoder@0.10.31 
│ ├── safe-buffer@5.1.1 
│ ├─┬ tildify@1.0.0 
│ │ └── user-home@1.1.1 
│ ├── uuid@3.1.0 
│ └── v8flags@2.1.1 
└─┬ mysql@2.15.0 
├── bignumber.js@4.0.4 
├─┬ readable-stream@2.3.3 
│ ├── isarray@1.0.0 
│ ├── process-nextick-args@1.0.7 
│ ├── string_decoder@1.0.3 
│ └── util-deprecate@1.0.2 
└── sqlstring@2.3.0 


2017-10-20T19:35:13.355Z	b76f309c-b5cd-11e7-b46f-4908306acb03	npm WARN autoinstall@1.0.0 No description
npm WARN autoinstall@1.0.0 No repository field.
npm WARN autoinstall@1.0.0 No license field.

2017-10-20T19:35:13.455Z	b76f309c-b5cd-11e7-b46f-4908306acb03	total 20
-rw-rw-r-- 1 sbx_user1061 485 2108 Oct 20 19:34 autoinstall.js
-rw-rw-r-- 1 sbx_user1061 485 2501 Oct 20 19:34 index.js
drwxrwxr-x 93 sbx_user1061 485 4096 Oct 20 19:35 node_modules
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:34 npm-13-d7a1f87a
-rw-rw-r-- 1 sbx_user1061 485 142 Oct 20 19:34 package.json

2017-10-20T19:35:13.457Z	b76f309c-b5cd-11e7-b46f-4908306acb03	total 376
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 ansi-regex
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 ansi-styles
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 array-unique
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 arr-diff
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 arr-flatten
drwxrwxr-x 5 sbx_user1061 485 4096 Oct 20 19:35 babel-runtime
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 bignumber.js
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 bluebird
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 braces
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 chalk
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 commander
drwxrwxr-x 13 sbx_user1061 485 4096 Oct 20 19:35 core-js
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 core-util-is
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 debug
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 detect-file
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 escape-string-regexp
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 expand-brackets
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 expand-range
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:34 expand-tilde
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 extend
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 extglob
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 filename-regex
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 fill-range
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:34 findup-sync
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 flagged-respawn
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 for-in
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 for-own
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 fs-exists-sync
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 generic-pool
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 global-modules
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 global-prefix
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 glob-base
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 glob-parent
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 has-ansi
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 homedir-polyfill
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 inherits
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 ini
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 interpret
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 isarray
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 is-buffer
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-dotfile
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-equal-shallow
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 isexe
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-extendable
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-extglob
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-glob
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-number
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 isobject
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-posix-bracket
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 is-primitive
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:34 is-windows
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 kind-of
drwxrwxr-x 6 sbx_user1061 485 4096 Oct 20 19:35 knex
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 liftoff
drwxrwxr-x 3 sbx_user1061 485 20480 Oct 20 19:35 lodash
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 micromatch
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 minimist
drwxrwxr-x 6 sbx_user1061 485 4096 Oct 20 19:35 mkdirp
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 ms
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 mysql
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 normalize-path
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 object.omit
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 os-homedir
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 parse-glob
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 parse-passwd
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 path-parse
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 pg-connection-string
drw
2017-10-20T19:35:13.457Z	b76f309c-b5cd-11e7-b46f-4908306acb03	xrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 preserve
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 process-nextick-args
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 randomatic
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 readable-stream
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 rechoir
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 regenerator-runtime
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 regex-cache
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 remove-trailing-separator
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 repeat-element
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 repeat-string
drwxrwxr-x 5 sbx_user1061 485 4096 Oct 20 19:35 resolve
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 resolve-dir
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 safe-buffer
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 sqlstring
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 string_decoder
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 strip-ansi
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 supports-color
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:34 tildify
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 user-home
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 util-deprecate
drwxrwxr-x 4 sbx_user1061 485 4096 Oct 20 19:35 uuid
drwxrwxr-x 2 sbx_user1061 485 4096 Oct 20 19:35 v8flags
drwxrwxr-x 3 sbx_user1061 485 4096 Oct 20 19:35 which

2017-10-20T19:35:13.477Z	b76f309c-b5cd-11e7-b46f-4908306acb03	require /tmp/index.js
2017-10-20T19:35:13.478Z	b76f309c-b5cd-11e7-b46f-4908306acb03	Calling handler...
2017-10-20T19:35:13.478Z	b76f309c-b5cd-11e7-b46f-4908306acb03	require knex
2017-10-20T19:35:14.418Z	b76f309c-b5cd-11e7-b46f-4908306acb03	Knex:warning - Knex.VERSION is deprecated, you can get the module versionby running require('knex/package').version
2017-10-20T19:35:14.418Z	b76f309c-b5cd-11e7-b46f-4908306acb03	knex.VERSION= 0.12.6
END RequestId: b76f309c-b5cd-11e7-b46f-4908306acb03
REPORT RequestId: b76f309c-b5cd-11e7-b46f-4908306acb03	Duration: 33306.69 ms	Billed Duration: 33400 ms Memory Size: 512 MB Max Memory Used: 217 MB	
*/

