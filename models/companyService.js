"use strict";
var serviceClient = require("./serviceClient");




function companyModel() {}

companyModel.prototype.createCompanies = function(callback) {

      var serviceObj = new serviceClient();
      var teamsObj = new Company(this.name, this.type);
    
   serviceObj.doRequest('CompanyService', 'createCompanies', {companies:teamsObj},callback);
   
};
   


companyModel.prototype.getCompaniesByStatement = function(callback) {

      var serviceObj = new serviceClient();
      var query = new statement(this.queryStatement);
               
      serviceObj.doRequest('CompanyService', 'getCompaniesByStatement', {filterStatement:query}, callback);
   
};

companyModel.prototype.updateCompanies = function(callback) {

      var serviceObj = new serviceClient();
      var companyObj = new company();
               
      serviceObj.doRequest('CompanyService', 'updateCompanies', {companies:companyObj},callback);
   
};

module.exports = companyModel;
/*
 * Comment this.id = "83922489" line, when creating new company, 
 * This value is read-only and is assigned by Google when the company is created.
 * id attribute is required for updates..
*/

function Company(name, type) {

  this.name = name;
	this.type = type;

}

function statement(query) {

    this.query = query;

}
