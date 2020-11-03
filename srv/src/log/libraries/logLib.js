const log = require('cf-nodejs-logging-support');
const correlator = require('express-correlation-id');

/* Logging library for SDC. All logs will be persisted in the Cloud Foundry space where the app runs
 * and will be tracked by Cloud Foundry logging tooling.
 */
function logLib() {

  const levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
  const loggingPattern = "{{written_at}} | {{level}} | {{msg}} {{data}}";

  /* Setups the logging severity priority. Being "error" the highest and "silly" the lowest.
   * The priority of the logs displayed is related to the index of the array. If set to lowest
   * all higher priority will also display.
   */
  function setLoggingLevel(level) {

    let loggingLevel = level;
    let msgLevel = levels[2];
    let description = `Logging level successfully setup to: ${loggingLevel}`;

    log.setLogPattern(loggingPattern);

    if (!levels.includes(loggingLevel)) {
      loggingLevel = levels[2];
      msgLevel = levels[1];
      description = `Unsupported logging level. Falling back to level: ${loggingLevel}`;
    }

    log.setLoggingLevel(loggingLevel);
    log.logMessage(msgLevel, description);
  }

  function logError(description, data, correlationId) {
    logMessage(levels[0], arguments.length, description, data, correlationId);
  }

  function logWarn(description, data, correlationId) {
    logMessage(levels[1], arguments.length, description, data, correlationId);
  }

  function logInfo(description, data, correlationId) {
    logMessage(levels[2], arguments.length, description, data, correlationId);
  }

  function logMessage(level, length, description, data, correlationId) {
    switch (length) {
      case 1:
        log.logMessage(level, description);
        break;
      case 2:
        log.logMessage(level, description, data);
        break;
      case 3:
        log.logMessage(level, `${description} | Correlation id: ${correlationId}`, data);
        break;
      default:
        log.info();
    }
  }

  function logger(req, res, callback) {
    logInfo(`Received ${req.method} request on url:${req.url}`, {'correlation_id': req.correlationId()});
    callback();
  }

  return {logger, setLoggingLevel, logError, logWarn, logInfo};
}

module.exports = logLib();