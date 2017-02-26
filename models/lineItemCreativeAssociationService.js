"use strict";
var serviceClient = require("./serviceClient");



 function lineitemCreativeAsscociationModel() {}


lineitemCreativeAsscociationModel.prototype.getLineItemCreativeAssociationsByStatement = function(done) {

      var serviceObj = new serviceClient();
         
      var query = new statement(this.args); 

       	   query = {filterStatement:query};
    
           serviceObj.doRequest('LineItemCreativeAssociationService', 'getLineItemCreativeAssociationsByStatement', query, done);
   
};

lineitemCreativeAsscociationModel.prototype.createLineItemCreativeAssociations = function(done) {

      var serviceObj = new serviceClient();
    
   		  serviceObj.doRequest('LineItemCreativeAssociationService', 'createLineItemCreativeAssociations', {lineItemCreativeAssociations:this.args}, done);
   
};


function statement(query) {

	this.query = query
};


module.exports = lineitemCreativeAsscociationModel;