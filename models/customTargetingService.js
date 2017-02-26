"use strict";
var serviceClient = require("./serviceClient");




function customTargetingServiceModel() {}




customTargetingServiceModel.prototype.getCustomTargetingKeysByStatement = function(done) {

      var serviceObj = new serviceClient();
      var query = new statement(this.queryStatement);
               
          serviceObj.doRequest('CustomTargetingService', 'getCustomTargetingKeysByStatement', {filterStatement:query}, done);
   
};


customTargetingServiceModel.prototype.getCustomTargetingValuesByStatement = function(done) {

      var serviceObj = new serviceClient();
      var query = new statement(this.queryStatement);
               
          serviceObj.doRequest('CustomTargetingService', 'getCustomTargetingValuesByStatement', {filterStatement:query}, done);
   
};

customTargetingServiceModel.prototype.createCustomTargetingKeys = function(done) {

      var serviceObj = new serviceClient();
      var query = new CustomTargetingKey();

               
      serviceObj.doRequest('CustomTargetingService', 'createCustomTargetingKeys', {keys:query}, done);
   
};

customTargetingServiceModel.prototype.createCustomTargetingValues = function(done) {

      var serviceObj = new serviceClient();
      var query = new CustomTargetingValue();
               
      serviceObj.doRequest('CustomTargetingService', 'createCustomTargetingValues', {values:query}, done);
   
};


function statement(query) {

    this.query = query;

}

function CustomTargetingKey() {

	this.name = 'demo4';
	this.displayName = 'Contextual';
	this.type = 'PREDEFINED';
	this.status = 'ACTIVE';

}

function CustomTargetingValue() {

	this.customTargetingKeyId = 698529;
	this.name = '1';
	this.matchType = 'EXACT';
	this.status = 'ACTIVE';
	
}

module.exports = customTargetingServiceModel;