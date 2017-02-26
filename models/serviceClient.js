"use strict";

function serviceClient() { //constructor

    this.dfpUser = new Dfp.User(NETWORK_CODE, APPLICATION_NAME,APP_VERSION, access_token);
  
}

serviceClient.prototype.doRequest = function(serviceType, OperationName, serviceArgs, callback) {

		this.dfpUser.getService(serviceType, function (err, response) {

			if (err) {
				callback(err);
				return;
			}

			response[OperationName](serviceArgs, callback);
		});

};

module.exports = serviceClient;
