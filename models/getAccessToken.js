

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

module.exports = accessTokenModel;

function accessTokenModel(){};



accessTokenModel.prototype.getAccessToken = function(callback) {
	
	var oauth2Client = new OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URL);

   		oauth2Client.setCredentials({refresh_token: this.refresh_token}); 

   		oauth2Client.refreshAccessToken(callback);

};

accessTokenModel.prototype.testing = function(callback){


		callback(null, "Hello world!");


};




