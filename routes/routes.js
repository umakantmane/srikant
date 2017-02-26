
   "use strict";

var lineItemService = require("../models/lineItemService")
  , companyService = require("../models/companyService")
  , orderService = require("../models/orderServices")
  , userService = require("../models/userServices")
  , teamService = require("../models/teamService")
  , customFieldService = require("../models/customFieldService")
  , customTargetingService = require("../models/customTargetingService")
  , audienceSegmentService = require("../models/audienceSegmentService")
  , creativeTemplateService = require("../models/creativeTemplateService")
  , lineItemCreativeAssociationService = require("../models/lineItemCreativeAssociationService")
  , creativeService = require('../models/creativeService')
  , getAccessToken = require("../models/getAccessToken");


	customFieldService = new customFieldService();
	creativeService = new creativeService();
	companyService = new companyService();
	teamService = new teamService();
	orderService = new orderService();
	userService = new userService();
	lineItemService = new lineItemService();
	customTargetingService = new customTargetingService();
	audienceSegmentService = new audienceSegmentService();
	creativeTemplateService = new creativeTemplateService();
	lineItemCreativeAssociationService = new lineItemCreativeAssociationService();
	getAccessToken = new getAccessToken();


	global.Dfp = require('node-google-dfp');

module.exports = function(app) {
	  
	  app.get("/createCompanies", function(req, res){

		  companyService.createCompanies(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });

	  app.get("/testing", function(req, res){

	  	  getAccessToken.testing(function(err, result){

	  	  		if(err)
	  	  			res.send(err);
	  	  		else
	  	  			res.send(result);

	  	  });

	  });

      app.get("/getAccessToken", function(req, res){

      	  getAccessToken.refresh_token = '1/d2Q7LBlsyWFlWqB6bimsT93ULQochEsYkUODO_Z62vk';

		  getAccessToken.getAccessToken(function(err, result){
	
		  	   if(err)
		  	    	res.send(err);
		  	    else
		  	    	res.send(result);

		  });

	  });


      app.get("/createCreatives", function(req, res){

	  	      // companyService.queryStatement = "WHERE name = 'xyz.com' and type='ADVERTISER'";

		  creativeService.createCreatives(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });

	  });

	  app.get("/getCompaniesByStatement", function(req, res){

	  	       companyService.queryStatement = "WHERE name = 'xyz.com' and type='ADVERTISER'";

		  companyService.getCompaniesByStatement(function(err, result){

		  		 
		  	   if(err && err.hasOwnProperty('code')) {  //handle internet exception

		  	   	   res.send(err);		

		  	   } else if (err) {

		  	   	  res.send(err);

		  	   }
		  	    
		  	    else
		  	    res.send(result);

		  });
	  });

         app.get("/getLineItemCreativeAssociationsByStatement", function(req, res){


	  	       lineItemCreativeAssociationService.queryStatement = "where lineItemId = '471047529'";

		  lineItemCreativeAssociationService.getLineItemCreativeAssociationsByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });
         
          
	   app.get("/getCreativeTemplatesByStatement", function(req, res){

	  	       creativeTemplateService.queryStatement = "WHERE name = 'New Martini Skin' AND status = 'ACTIVE'";

		  creativeTemplateService.getCreativeTemplatesByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else {

		  	   	var data = result.rval.results[0].variables;

		  	   	  for(var i in  data) {

		  	   	  	 if (data[i].hasOwnProperty('choices')) {

		  	   	  	 		console.log("choices", data[i].choices);
		  	   	  	 }
		  	   	  	 	
		  	   	   else if (data[i].hasOwnProperty('mimeTypes')) {

		  	   	  	console.log("mimeTypes", data[i].mimeTypes);

		  	   	  }	 else if(data[i].hasOwnProperty('isTrackingUrl')) {

		  	   	  	console.log("isTrackingUrl", data[i].isTrackingUrl);

		  	   	  }	

           }
		  	   	  res.send(result.rval.results[0].variables);	
		  	    } 

		  	    

		  });
	  });

	  app.get("/getCustomTargetingKeysByStatement", function(req, res){

	  	       customTargetingService.queryStatement = "WHERE type='PREDEFINED'";

		  customTargetingService.getCustomTargetingKeysByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	  app.get("/createCustomTargetingKeys", function(req, res){

	  	      
		  customTargetingService.createCustomTargetingKeys(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });

	  });

	   app.get("/getAudienceSegmentsByStatement", function(req, res){

	  	       audienceSegmentService.queryStatement = "";

		  audienceSegmentService.getAudienceSegmentsByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	  app.get("/getCustomTargetingValuesByStatement", function(req, res){

	  	       customTargetingService.queryStatement = "where customTargetingKeyId='698169'  AND status = 'ACTIVE'";

		  customTargetingService.getCustomTargetingValuesByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });

	  app.get("/createCustomTargetingValues", function(req, res){
	  	      
		  customTargetingService.createCustomTargetingValues(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });

	   app.get("/getCustomFieldsByStatement", function(req, res){

	  	       customFieldService.queryStatement = "";

		  customFieldService.getCustomFieldsByStatement(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	   app.get("/getTeamsByStatement", function(req, res){

		  	       teamService.queryStatement = "WHERE name = 'South East'";

			  teamService.getTeamsByStatement(function(err, result){
		
			  	   if(err)
			  	    res.send(err);
			  	    else
			  	    res.send(result);

			  });
	  });

	    app.get("/createTeams", function(req, res){

		  teamService.createTeams(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	  app.get("/updateCompanies", function(req, res){

		  companyService.updateCompanies(function(err, result){
	
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	   app.get("/createOrder", function(req, res){

          orderService.orderParams = "";
		  orderService.createOrder(function(err, result){
		  	 
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	   app.get("/getOrdersByStatement", function(req, res){

           orderService.queyStatement = "WHERE name = '2WTW' ORDER BY lastModifiedDateTime desc";
		  orderService.getOrdersByStatement(function(err, result){
		  	   
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	   app.get("/updateOrders", function(req, res){

		  orderService.updateOrders(function(err, result){
		  	 
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	   app.get("/createUsers", function(req, res){

		  userService.createUsers(function(err, result){
		  	  
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });


	    app.get("/getUsersByStatement", function(req, res){

           userService.queryStatement = "WHERE email = 'umakant.b@2adpro.com' and status='ACTIVE'";
   
		  userService.getUsersByStatement(function(err, result){
		  	   if(err)
		  	    res.send(err);
		  	    else
		  	    res.send(result);

		  });
	  });

	    app.get("/getAllRoles", function(req, res){
   
		  userService.getAllRoles(function(err, result){
		  	  
		  	   if(err)
		  	     res.send(err);
		  	     else
		  	     res.send(result);

		  });
	  }); 
	    

	    app.get("/getCurrentUser", function(req, res){
   
		  userService.getCurrentUser(function(err, result){
		  	  
		  	   if(err)
		  	     res.send(err);
		  	     else
		  	     res.send(result);

		  });
	  }); 

	    app.get("/createLineItems", function(req, res){

		  lineItemService.createLineItems(function(err, result){
		  	   if(err)
		  	     res.send(err);
		  	     else
		  	     res.send(result);

		  });
	  });

	    app.get("/getLineItemsByStatement", function(req, res){


	    	lineItemService.queryStatement = "WHERE OrderId = '480575769'";
		  lineItemService.getLineItemsByStatement(function(err, result){
		  	   if(err)
		  	     res.send(err);
		  	     else
		  	     res.send(result);

		  });
	  });

	    app.get("/updateLineItems", function(req, res){

		  lineItemService.updateLineItems(function(err, result){
		  	   if(err)
		  	     res.send(err);
		  	     else
		  	     res.send(result);

		  });
	  });


}