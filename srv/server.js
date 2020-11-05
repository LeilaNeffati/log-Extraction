"use strict";
const express = require("express");
const cds = require("@sap/cds");
const log = require('cf-nodejs-logging-support');
const correlator = require("express-correlation-id");
const logLib = require("./src/log/libraries/logLib");
const logHandlers = require("./src/log/handlers/log_handler");
const errorTracker = require("./src/log/libraries/errorTracker");
const loggingLevel = "info";
const xsenv = require("@sap/xsenv");
const passport = require("passport");
const xssec = require("@sap/xssec");
const JWTStrategy = require("@sap/xssec").JWTStrategy;

const app = express();
const port = process.env.PORT || 8080;

//XSUAA Middleware
passport.use(new JWTStrategy(xsenv.getServices({
    uaa: {
        tag: "xsuaa"
    }
}).uaa));

app.use(correlator());
app.use(logLib.logger);

logLib.setLoggingLevel(loggingLevel);

var cfenv = require("cfenv");
var appenv = cfenv.getAppEnv();
logLib.logInfo("application_name: " + appenv.application_name);

(async () => {
	
    logLib.logInfo(`Establishing connection to database...`);
    const t0 = Date.now();
    await cds.connect();
    const timeToConnect = Date.now() - t0;
    logLib.logInfo(`Database Connection established in ${timeToConnect}ms.`);
    

    logLib.logInfo('Setting up views...');
    const t1 = Date.now();

    await cds
        .serve('catalogue')
        .from('./gen/csn.json')
        .in(app)
        .at("/Catalogue")
        .with((srv) => {
            logHandlers(srv);
        });

    const timeToViews = Date.now() - t1;
    logLib.logInfo(`Views were set in ${timeToViews}ms.`);
    // Setting up error middleware for all routes
    app.use(errorTracker.resourceNotFound);
    app.listen(port, () => {
        logLib.logInfo(`log app server started. Listening on port: ${port}`);
    });
})();
app.use(errorTracker.track);
module.exports = app;