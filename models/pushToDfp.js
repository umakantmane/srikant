"use strict";

var db = require('../config/db');
const appconfig = require('appconfig');
appconfig.load();

var kue = require('kue');
var queue = kue.createQueue({redis: appconfig.constant.REDIS_CONNECTION_STRING});


var pushJobsToDfp = module.exports;

var restClient = require('./restClient');
var restClientObj = new restClient();

pushJobsToDfp.getJobsToPushInDfp = function (callback) {

    restClientObj.requestName = 'line-items?requestType=PUSH_TO_DFP';

    restClientObj.getLineItems(function (err, result) {

        if (err) {

            console.log("Error", err);
            return;

        } else {
            
                for (var i in result) {
                   
                    var jobs = queue.create('push-to-dfp', {orderId:result[i].line_order_id, trackingNo:result[i].trackNo, line_id:result[i].line_id, title: "LineItem-" + result[i].line_id+" | trackingNo: "+orders.trackNo});//.attempts(3);

                    jobs.on('failed attempt', function (errorMessage, doneAttempts) {

                        console.log('Job failed', errorMessage, doneAttempts);

                    });

                    jobs.on('failed', function (errorMessage) {

                        console.log("failed", errorMessage+"\n\n\n");

                    });

                    jobs.on('complete', function (result) {

                        console.log('Job completed with data ', result.line_id+"\n\n\n");

                        //update status as job completed
                    });

                    jobs.on('progress', function (progress, data) {

                        console.log('\r  Progress Report job #' + job.id + ' ' + progress + '% complete with data ', data);

                    });

                    /**
                      * if job taking more than 3 minutes to process,
                      * then this particular job will be marked as failed due to time limit has been exceeded    
                    */


                    jobs.ttl(180000).save(function (err) {
                        if (err)
                            console.log(err);
                    });

                }
        }

    });
};

