"use strict";

var cron = require('node-cron')
  , google = require('googleapis')
  , OAuth2 = google.auth.OAuth2;

/*
    the bellow function set the accessToken at the point of application starts
*/

 var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

                oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

                oauth2Client.refreshAccessToken(function (err, token) {

                    if (!err) { 

                        global.access_token = token.access_token;

                        console.log(token);
                        // require('../workers/validationWorkers');
                        //require('../workers/pushToDfpWorkers');

                   } else {

                        //Track the error log on console
                        console.log("Error", err);

                   }
  });
                

/*
  the bellow function is cronJob, which set the accessToken every 5 minutes

*/
 
cron.schedule('*/5 * * * *', function(){

                oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

                oauth2Client.refreshAccessToken(function (err, token) {

                    if (!err) { 

                        global.access_token = token.access_token;

                        console.log(token);

                   } else {

                    //Track the error log on console
                       console.log("Error", err);

                   }
                });

});
    