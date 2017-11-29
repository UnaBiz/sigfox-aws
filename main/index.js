//  Helper for main function
/*  eslint-disable max-len,camelcase,import/no-extraneous-dependencies,import/no-unresolved,global-require,import/newline-after-import,no-console */

process.on('uncaughtException', err => console.error('uncaughtException', err.message, err.stack));  //  Display uncaught exceptions.
process.on('unhandledRejection', (reason, p) => console.error('unhandledRejection', reason, p));  //  Display uncaught promises.

const scloud = require('sigfox-aws');

function getMainFunction(wrapper, wrap, package_json) {
  //  Return the AWS Lambda startup function main(), if defined in the wrap() function.
  //  If the wrap() function defines task(), return the main() function
  //  from sigfox-iot-cloud, after passing task() to main().
  if (!wrapper || !wrap) throw new Error('Missing wrapper or wrap function');
  if (!wrapper.main && !wrapper.task) Object.assign(wrapper, wrap(scloud, package_json));
  const mainFunc = wrapper.main ? wrapper.main.bind(wrapper) : scloud.main.bind(wrapper);
  const taskFunc = wrapper.task ? wrapper.task.bind(wrapper) : null;
  return (event, context, callback) => mainFunc(event, context, callback, taskFunc);
}

module.exports = {
  getMainFunction,
};
