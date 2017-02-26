"use strict";

var cron = require('node-cron')
  , google = require('googleapis')
  , OAuth2 = google.auth.OAuth2
  , datetime = require('node-datetime')
  , db = require("./config/db");

  db.initDb();

    var oauth2Client = ''
      , tokenExpireDateTime = ''
      , currentDateTime = '';


currentDateTime = datetime.create();
currentDateTime = currentDateTime.format('Y:m:d H:M:S');

console.log(currentDateTime);
var cron = require('node-cron');
 
//cron.schedule('*/45 * * * *', function(){

  conn.query("SELECT * from accounts WHERE acc_id = ?", [4], function (err, result) {

        for (var i in result) {

            (function (i) {

                oauth2Client = new OAuth2(result[i].acc_client_id, result[i].acc_client_secret, REDIRECT_URL);

                oauth2Client.setCredentials({refresh_token: result[i].acc_refresh_token});

                oauth2Client.refreshAccessToken(function (err, token) {

                    if (!err) { 
                
                        tokenExpireDateTime = datetime.create(token.expiry_date);
                        tokenExpireDateTime = tokenExpireDateTime.format('Y:m:d H:M:S');

                        currentDateTime = datetime.create();
                        currentDateTime = currentDateTime.format('Y:m:d H:M:S');

                        conn.query('UPDATE oauth_access_key SET oak_access_token = ?, oak_active_date = ?, oak_expiry_date = ? WHERE oak_acc_id = ?', [token.access_token, currentDateTime, tokenExpireDateTime, result[i].acc_id], function (error, updateResults){});
                   
                        console.log("Done", currentDateTime);
                        global.access_token = token.access_token;
                   }
                });
            })(i);
        } 
    });
//});
    