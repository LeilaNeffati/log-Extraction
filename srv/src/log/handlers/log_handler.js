const passport = require("passport");
const xsenv = require("@sap/xsenv");
const cfLib1 = require('cloudfoundry-cli');
const cfLib2 = require('cf-nodejs-client')

const JWTStrategy = require("@sap/xssec").JWTStrategy;

module.exports = cds.service.impl(srv => {

	srv.on('READ', 'log', async(req, res) => {
		passport.use(new JWTStrategy(xsenv.getServices({
			uaa: {
				tag: "xsuaa"
			}
		}).uaa));
		var services = xsenv.readServices();

		const endpoint = "https://api.cf.us10.hana.ondemand.com";
		const username = "naffeti.leila@gmail.com";
		const password = "Ilovemami@159";

		const CloudController = new(cfLib2).CloudController(endpoint);
		const UsersUAA = new(cfLib2).UsersUAA;
		const Apps = new(cfLib2).Apps(endpoint);
		const Logs = new(cfLib2).Logs();

		var authorization_endpoint = null;
		var token_endpoint = null;
		var logging_endpoint = null;
		var token_type = null;
		var access_token = null;
		var log_value = "";

		CloudController.getInfo().then((result) => {
			authorization_endpoint = result.authorization_endpoint;
			token_endpoint = result.token_endpoint;
			logging_endpoint = result.doppler_logging_endpoint;
			//https://doppler.cf.us10.hana.ondemand.com:443/apps/6927a3f9-8a46-488b-91f4-a2b5c9f5ed3b/recentlogs
			//Logs.setEndPoint(result.authorization_endpoint);
			UsersUAA.setEndPoint(authorization_endpoint);
			return UsersUAA.login(username, password);
		}).then((result) => {
			UsersUAA.setToken(result);
			Apps.setToken(result);
			Logs.setToken(result);
			return Apps.getApps();
		}).then((result) => {
			var appGuid = result.resources[1].metadata.guid;
			//Process URL
			console.log(logging_endpoint);
			logging_endpoint = logging_endpoint.replace("wss", "https");
			// = logging_endpoint.replace(":4443", "");
			//logging_endpoint = logging_endpoint.replace(":443", ""); //Bluemix support
			console.log(logging_endpoint);
			Logs.setEndPoint(logging_endpoint);
			return Logs.getRecent(appGuid);

		}).then((result) => {
			log_value = result;
			console.log(result);
		}).catch((reason) => {
			console.error("Error: " + reason);
		});

		req.reply([{
			"log": log_value
		}]);
	});

	srv.on('READ', 'execute', async(req, res) => {

		const {
			exec
		} = require("child_process");

		exec("ls -la", (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
		});

		req.reply([{
			"log": "log_value"
		}]);
	});
});