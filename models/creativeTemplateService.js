"use strict";
var serviceClient = require("./serviceClient");



 function creativeTemplateServiceModel() {}


creativeTemplateServiceModel.prototype.getCreativeTemplatesByStatement = function(done) {

      var serviceObj = new serviceClient();
    
       var query = new statement(this.queryStatement);
    
   serviceObj.doRequest('CreativeTemplateService', 'getCreativeTemplatesByStatement', {filterStatement:query}, done);
   
};




function statement(query) {

	this.query = query
}




module.exports = creativeTemplateServiceModel;