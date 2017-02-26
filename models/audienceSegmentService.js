"use strict";
var serviceClient = require("./serviceClient");




function audienceSegmentService() {}


audienceSegmentService.prototype.getAudienceSegmentsByStatement = function(done) {

      var serviceObj = new serviceClient();
      var query = new statement(this.queryStatement);
               
      serviceObj.doRequest('AudienceSegmentService', 'getAudienceSegmentsByStatement', {filterStatement:query}, done);
   
};



function statement(query) {

    this.query = query;

}

module.exports = audienceSegmentService;