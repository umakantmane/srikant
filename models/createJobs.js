"use strict";

var db = require('../config/db');
const appconfig = require('appconfig');
appconfig.load();

var kue = require('kue');
var queue = kue.createQueue({redis: appconfig.constant.REDIS_CONNECTION_STRING});
var https = require('https');
var cron = require('node-cron')

var createJobs = module.exports;
var restClient = require('./restClient');
var restClientObj = new restClient();

     cron.schedule('*/5 * * * *', function(){

        restClientObj.requestName = 'line-items';
      
    restClientObj.getLineItems(function (err, result) {

        if (err) {
            console.log("Error", err);
            return;
        } else {
                
            for (var i in result) {

                var jobs = queue.create('lineitems', {lineStatus:result[i].status, oderdId:result[i].line_order_id, trackingNo:result[i].trackNo, title: result[i].line_id+" | trackingNo: "+result[i].trackNo, line_id: result[i].line_id});//.attempts(3);

                jobs.on('failed attempt', function (errorMessage, doneAttempts) {

                    console.log('Job failed', errorMessage, doneAttempts);

                });

                jobs.on('failed', function (errorMessage) {

                    console.log("failed", errorMessage);

                });

                jobs.on('complete', function (result) {

                    console.log('Job completed Successfully');

                    //update status as job completed
                });

                jobs.on('progress', function (progress, data) {

                    console.log('\r  Progress Report job #' + job.id + ' ' + progress + '% complete with data ', data);

                });

                /*
                  * if job taking more than 3 minutes in processing,
                  * then this particular job will be marked as failed due to time limit has been exceeded    
                */

                jobs.ttl(300000).save(function (err) {  
                    if (err)
                        console.log(err);
                });

                /*jobs.attempts(3).backoff(function (attempts, delay) {

                    console.log("Repeat", attempts, delay);

                });*/

            }

        }

    });

  });    


