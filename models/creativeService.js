"use strict";
var serviceClient = require("./serviceClient");


 function createCreativeModel() {}


createCreativeModel.prototype.createCreatives = function(done) {


      var serviceObj = new serviceClient();
    
          serviceObj.doRequest('CreativeService', 'createCreatives', this.args, done);
   
};


function statement(query) {

  this.query = query;

};


module.exports = createCreativeModel;