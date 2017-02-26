"use strict";
var serviceClient = require("./serviceClient");



 function userModel() {}


 userModel.prototype.getUsersByStatement = function(done) {

      var serviceObj = new serviceClient();     
      var query = new statement(this.queryStatement);
    
   serviceObj.doRequest('UserService', 'getUsersByStatement', {filterStatement:query}, done);
   
};


function statement(query) {

     this.query = query;     
     
}


module.exports = userModel;