"use strict";
var serviceClient = require("./serviceClient");



 function lineItemModel() {}


lineItemModel.prototype.createLineItems = function(done) {

      var serviceObj = new serviceClient();
      var lineItemObj = new lineItem(this.args);
    
          serviceObj.doRequest('LineItemService', 'createLineItems', {lineItems:lineItemObj}, done);
   
};

lineItemModel.prototype.updateLineItems = function(done) {

      var serviceObj = new serviceClient();
      var lineItemObj = new lineItem(this.args);
    
          serviceObj.doRequest('LineItemService', 'updateLineItems', {lineItems:lineItemObj}, done);
   
};

lineItemModel.prototype.getLineItemsByStatement = function(done) {

      var serviceObj = new serviceClient();
      var lineItemObj = new statement(this.queryStatement); //"WHERE status = 'ACTIVE' ORDER BY id LIMIT 30"
    
          serviceObj.doRequest('LineItemService', 'getLineItemsByStatement', {filterStatement:lineItemObj}, done);
   
};



function statement(query) {

	this.query = query
}


function lineItem(args) {

	for(var i in args) {
		this[i] = args[i];
	}   

}



function Date(){};

function DateTime(){};

function Money(){};

function CreativePlaceHolder(){};

function Size(){};

function Goal(){};

function Targeting(){};

function AdUnitTargeting(){};

function CountryLocation(){};

function GeoTargeting(){};


module.exports = lineItemModel;