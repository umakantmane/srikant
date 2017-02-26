"use strict";
var serviceClient = require("./serviceClient");


function teamModel() {}

  
teamModel.prototype.createTeams = function(done) {

      var serviceObj = new serviceClient();
      var teamObj = new team();
         
      serviceObj.doRequest('TeamService', 'createTeams', {teams:teamObj}, done);
   
};

teamModel.prototype.getTeamsByStatement = function(done) {

      var serviceObj = new serviceClient();
      var query = new statement(this.queryStatement);
               
      serviceObj.doRequest('TeamService', 'getTeamsByStatement', {filterStatement:query}, done);
   
};


module.exports = teamModel;

function statement(query) {

    this.query = query;

}

function team() {

  this.name = "xyz-demo";
  this.teamAccessType = "NONE";

}
