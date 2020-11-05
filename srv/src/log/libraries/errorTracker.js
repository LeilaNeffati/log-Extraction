const logLib = require('./logLib');


/* Error handler for the app. All errors catch in any of the routes will be handled by this middleware. All errors will
 * be automatically logged as logError via logLib.
 */
function errorTracker() {

  /* Middleware function to catch not found resources. It will trigger whenever a resource is not
  * registered in any of the handlers
  */
  function resourceNotFound(req, res, next) {
    res.status(404).json({error: {message: 'Not found'}});
  }

  /* Middleware function to catch possible errors in the application. It automatically triggers and sets
  * the status code if exists otherwise defaults to 500 - INTERNAL SERVER ERROR and returns the error object
  */
  function track(error, req, res, next) {

    const status = error.status || 500;
    const stack = error.stack;
    const correlationId = req.correlationId();
    let message = 'Internal Server Error';

    if (error.status || error.code) {
      message = error.message;
    }

    logLib.logError(message, stack, correlationId);

    // clean up open transactions if any
   

    res.status(status).json({
      error: {
        code: error.code,
        message: message
      }
    });
  }

  return {track, resourceNotFound};
}

module.exports = errorTracker();
