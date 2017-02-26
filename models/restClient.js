"use strict";

var Client = require('node-rest-client').Client,
    client = new Client(),
    requestsync = require('sync-request'),
    request = require("request");


function restClient() {}

restClient.prototype.getLineItems = function (done) {

    var restUrl = JDTRAFFIC_WS_URL + '/' + this.requestName;
       console.log(restUrl);
       
    client.get(restUrl  , function (data, response) {

        done(null, data.data);
        return;

    });

};

restClient.prototype.getData = function () {

    var restUrl = JDTRAFFIC_WS_URL + '/' + this.requestName + '/' + this.requestData;
    console.log(restUrl);
    var res = requestsync('GET', restUrl);
        res = res.getBody('utf8');
        res = JSON.parse(res);
        return res.data;

};



restClient.prototype.updateData = function (done) {

    var restUrl = JDTRAFFIC_WS_URL + '/' + this.requestName + '/' + this.requestData;

    console.log(restUrl);
    client.put(restUrl, function (data, response) {

        done(null, data);
        return;
    });

};

restClient.prototype.createData = function (done) {

    

    var restUrl = JDTRAFFIC_WS_URL + '/' + this.requestName + this.requestData;

    console.log(restUrl);

    var options = {method: 'POST',
        url: restUrl,
        headers: {
            'content-type': 'application/x-www-form-urlencoded'},
            form: this.requestBody};

    request(options, function (error, response, body) {});

};

module.exports = restClient;

