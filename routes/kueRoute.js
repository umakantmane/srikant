"use strict";

var createJobsModel = require("../models/createJobs");
var pushToDfpModel = require("../models/pushToDfp");

module.exports = function function_name(app) {

   /* this route will validate the jobs*/

   app.get('/createJobs', function(req, res) {
		
		//createJobsModel.getJobs(function(err, result){});
                 
        res.send("This service has been disabled!"); 
       
   });
   
   /* this route will push the jobs in dfp*/
   
    app.get('/pushToDfp', function(req, res) {
		
		pushToDfpModel.getJobsToPushInDfp(function(err, result){});
                 
                 res.send("Dfp Jobs");  
       
   });

};

