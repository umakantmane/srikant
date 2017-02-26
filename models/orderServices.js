"use strict";
var serviceClient = require("./serviceClient");


 

function orderModel() {}



orderModel.prototype.getOrdersByStatement = function(done) {

      var serviceObj = new serviceClient();     
      var query = new statement(this.queyStatement);

          serviceObj.doRequest('OrderService', 'getOrdersByStatement', {filterStatement:query}, done);
   
};


orderModel.prototype.createOrder = function(done) {

      var serviceObj = new serviceClient();
      var orderObj = new Order(this.orderParams);
    
          serviceObj.doRequest('OrderService', 'createOrders', {orders:orderObj}, done);
  
};


function Order(data) {

	this.name = data.name;
  this.poNumber = data.trackNo;
  this.advertiserId = data.advertiserId;
  this.traffickerId = data.userId;
  if (data.customFieldValues != '')
  this.customFieldValues = data.customFieldValues;
  
}


function statement(query) {

     this.query = query;     

}

module.exports = orderModel;