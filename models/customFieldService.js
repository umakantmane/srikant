"use strict";
var serviceClient = require("./serviceClient");


 

function customFieldModel() {}



customFieldModel.prototype.getCustomFieldsByStatement = function(done) {

      var serviceObj = new serviceClient();     
      var query = new statement(this.queryStatement);
    
   		  serviceObj.doRequest('CustomFieldService', 'getCustomFieldsByStatement', {filterStatement:query}, done);
   
};



function statement(query) {

     this.query = query;     

}

module.exports = customFieldModel;