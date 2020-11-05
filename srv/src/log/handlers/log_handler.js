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
		const UsersUAA = new(require("cf-nodejs-client")).UsersUAA;
		const Apps = new(require("cf-nodejs-client")).Apps(endpoint);
		const Logs =new(cfLib2).Logs;

		CloudController.getInfo().then((result) => {
			UsersUAA.setEndPoint(result.authorization_endpoint);
			return UsersUAA.login(username, password);
		}).then((result) => {
			Apps.setToken(result);
			return Apps.getApps();
		}).then((result) => {
			var appLog = Logs.getRecent(endpoint,username,password,"6722edd8-0e63-485a-8b56-dd52418aef37");
			console.log(result);
		}).catch((reason) => {
			console.error("Error: " + reason);
		});

		req.reply([{
			"log": "log input example"
		}]);
	});
});