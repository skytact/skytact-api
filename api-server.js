'use strict';

const api = require('./src/api-test.js');
const cloud = require('./src/cloud-api-test.js');

require('greenlock-express')
    .init({
        packageRoot: __dirname,

        // contact for security and critical bug notices
        maintainerEmail: "skytact@outlook.com",

        // where to look for configuration
        configDir: './greenlock.d',

        // whether or not to run at cloudscale
        cluster: false
    })
    // Serves on 80 and 443
    // Get's SSL certificates magically!
    .ready(httpsWorker);


function httpsWorker (glx) {
	const httpsServer = glx.httpsServer(null, api);
	httpsServer.listen(2727, "0.0.0.0", () => {
		console.log("listening on ", httpsServer.address());
	});
	/*const httpsCloud = glx.httpsServer(null, cloud);
	httpsCloud.listen(2728, "0.0.0.0", () => {
		console.log("good", httpsCloud.address());
	});*/
	const httpServer = glx.httpServer();
	httpServer.listen(80, "0.0.0.0", () => {
		console.log("good", httpServer.address());
	});
}
