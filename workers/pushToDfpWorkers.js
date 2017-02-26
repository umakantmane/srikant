    "use strict";
var kue = require('kue'),
        restClient = require('../models/restClient'),
        serviceClient = require('../models/serviceClient'),
        companyService = require("../models/companyService"),
        datetime = require('node-datetime'),
        teamService = require("../models/teamService"),
        teamNames = require('../models/teamNames'),
        orderService = require("../models/orderServices"),
        async = require("async"),
        lineItemService = require("../models/lineItemService"),
        userService = require("../models/userServices"),
        customTargetingService = require("../models/customTargetingService"),
        audienceSegmentService = require("../models/audienceSegmentService"),
        customFieldService = require("../models/customFieldService"),
        creativeService  = require('../models/creativeService'),
        lineItemCreativeAssociationService = require("../models/lineItemCreativeAssociationService"),
        sizeOf = require('image-size'),
        fs = require('fs'),
        audienceSegmentService = require("../models/audienceSegmentService"),
        htmlparser = require("htmlparser2"),
        creativeTemplateService = require("../models/creativeTemplateService"),
        querystring = require('querystring');
        const appconfig = require('appconfig');
        appconfig.load();
        lineItemService = new lineItemService();
        creativeService = new creativeService();
        lineItemCreativeAssociationService = new lineItemCreativeAssociationService();
        companyService = new companyService();
        orderService = new orderService();
        customTargetingService = new customTargetingService();
        teamService = new teamService();
        creativeTemplateService = new creativeTemplateService();
        audienceSegmentService = new audienceSegmentService();
        userService = new userService();
        customFieldService = new customFieldService();

        
        
/* The bellow function will add 7 hours to current date*/

Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
}

/* The bellow function will conver the date object into required date formate Exmaple: YY-MM-DD HH:MM:DD */

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-') +" "+[d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
}

var queue = kue.createQueue({redis: appconfig.constant.REDIS_CONNECTION_STRING});


queue.on( 'error', function( err ) {
        
        console.log( 'Oops... ', err);

});


queue.process('push-to-dfp', function (job, done) {

     var restClientObj = new restClient();
         restClientObj.requestName = 'line-items';
         restClientObj.requestData = job.data.line_id+'?requestType=GET_LINEITEM';
    var data = restClientObj.getData();

        reportDfpError = 1;
        reportDone = done;
        reportLineItemId =  data.line_id;

    var errorCount = 0;
    var errorBox = [];
        restClientObj.requestName = 'orders';
        restClientObj.requestData = data.line_order_id + '?requestType=GET_ORDER_DETAIL';
    var readyOrders = restClientObj.getData();
    var trackingNumber = readyOrders.trackNo;
    var advertiser = readyOrders.advertiserName;
        advertiser = advertiser.replace(/_/g, " ");
    var orderName = readyOrders.name;
    var jobPrefix = orderName.split("-");
        jobPrefix = jobPrefix[0];
    var teamName = teamNames[jobPrefix];
    var primarySalesPerson = readyOrders.primarySalesPerson;

    if (teamName == undefined) {
    
        teamName = readyOrders.siteName;

    }

    if (jobPrefix == 'DESC') {

        if (readyOrders.siteId == 358)
            teamName = 'Hampshire and Dorset';
        else
            teamName = readyOrders.siteName;
        if (readyOrders.siteId == 296)
            teamName = "South East";
    } else if (jobPrefix == 'WG') {

        teamName = 'Wales';

    } else {

        if (readyOrders.siteId == '356')
            teamName = 'Hampshire and Dorset';
    }


    async.waterfall([
        function (callback) {

            var whereCond = '';

            if (advertiser != '') {
                 whereCond = " where name=" + "'" + advertiser + "'" + " and type='ADVERTISER'";
            } 

            companyService.queryStatement = whereCond;

            companyService.getCompaniesByStatement(function (err, companyResponse) {

                if (err && err.hasOwnProperty('Create Client Error Error')) {

                    errorCount = 1;
                    errorBox.push(err);
                    callback(errorCount, errorBox);
                    return;

                }
                else if (err) {

                        console.log(err);
                        errorCount = 1;
                        //errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getCompaniesByStatement!");
                        errorBox.push(err+"@Error occured while getCompaniesByStatement!");         
                        callback(errorCount, errorBox);
                        return;

                    }

                if (companyResponse.hasOwnProperty('rval') && companyResponse.rval.totalResultSetSize == 0) {

                    callback(null, 0);
                    return;

                } else {

                    callback(null, companyResponse.rval.results[0]);
                    return;
                }

            });
        },
        function (companyResponse, callback) {


            if (companyResponse == 0) {

                if (teamName == undefined) {

                    var whereTeam = "";

                } else {

                    var whereTeam = "WHERE name = " + "'" + teamName + "'";

                }
       
                teamService.queryStatement = whereTeam;
                teamService.getTeamsByStatement(function (err, teamResponse) {

                    var teamId = '';
                    
                    /**
                      *uncomment bellow commented lines in live
                    */

                     if (err) {
                        
                        /*errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring);     
                        done(errorCount, errorBox);
                        return;*/

                    }

                    
                    /*if (teamResponse.hasOwnProperty('rval') && teamResponse.rval.totalResultSetSize > 0) {
                     
                     teamId = teamResponse.rval.results[0].id;
                     }
                     */ 

                    companyService.name = advertiser;
                    companyService.type = "ADVERTISER";

                    if (teamId != '')
                        companyService.appliedTeamIds = [teamId];

                    companyService.createCompanies(function (err, createCompanyResponse) {
                        
                         if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while createCompanies!");
                        callback(errorCount, errorBox);
                        return;
                    }

                        /* if (result.hasOwnProperty('statusCode')) {
                         
                         errorCount = 1;
                         
                         } else if(result.hasOwnProperty("rval")) {
                         
                         companyResponse = result.rval.results;
                         } */
                        // console.log("createCompanyResponse", createCompanyResponse);
                        callback(null, createCompanyResponse.rval[0]);
                        return;

                    });
                });
            } else {

                callback(null, companyResponse);
                return;

            }

        },
        function (companyResponse, callback) {

                console.log("dfpAdvertiserId=>", companyResponse.id);
           
            orderService.queyStatement = "WHERE name = '" + orderName + "' ORDER BY lastModifiedDateTime desc";
            orderService.getOrdersByStatement(function (err, orderResponse) {
                
                 if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getOrdersByStatement!");     
                        callback(errorCount, errorBox);
                        return;
                    }
                

                if (orderResponse.hasOwnProperty("rval") && orderResponse.rval.totalResultSetSize > 0) {
                    
                    callback(null, companyResponse, orderResponse.rval.results[0]);
                    return;

                } else {

                    callback(null, companyResponse, 0);
                    return;

                }

            });
        },
        function (companyResponse, orderResponse, callback) {

            if (orderResponse != 0) {

                var restClientObj = new restClient(); 
                    restClientObj.requestName = 'orders';
                var dfpOrderId = orderResponse.id;
                    restClientObj.requestData = readyOrders.id + '?dfp_order_id=' + dfpOrderId + '&requestType=UPDATE_DFP_NO';
                
                restClientObj.updateData(function (err, result) {});
                callback(null, companyResponse, orderResponse, 0);
                return;

            } else {

                userService.queryStatement = "WHERE email = '"+USER_EMAIL_ID+"' and status='ACTIVE'";

                userService.getUsersByStatement(function (err, userResponse) {
                    
                    if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getUsersByStatement!");     
                        done(null, data);
                        return;
                    }

                    callback(null, companyResponse, orderResponse, userResponse.rval.results[0]);
                    return;
                });
            }

        },
        function (companyResponse, orderResponse, userResponse, callback) {

            
            if (orderResponse == 0) {

                var displayName = '2AdPro'; //Replace 2AdPro in live
                    customFieldService.queryStatement = "WHERE name = 'Trafficking Team'"; //Replace in live
                var customFieldResponse = '';

                customFieldService.getCustomFieldsByStatement(function (err, result) {
                    
                     if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getCustomFieldsByStatement!");     
                        callback(errorCount, errorBox);
                        return;

                    } else if(result.rval.totalResultSetSize > 0) {

                        result = result.rval.results;
                        
                        for(var i in result) {

                            if (result[i].entityType == 'ORDER' && result[i].attributes['xsi:type'] == 'DropDownCustomField') {

                                var options = result[i].options;

                                    customFieldResponse = {};

                                for(var j in options) {

                                    if (options[j].displayName == displayName) {

                                            customFieldResponse.attributes = {'xsi:type': 'DropDownCustomField'};
                                            customFieldResponse.customFieldId = options[j].customFieldId;
                                            customFieldResponse.customFieldOptionId = options[j].id;
                                    }

                                }

                            }
                        }

                        callback(null, companyResponse, orderResponse, userResponse, customFieldResponse);
                        return;

                    } else {

                         callback(null, companyResponse, orderResponse, userResponse, customFieldResponse);
                        return;
                    }

                });

            } else {

                callback(null, companyResponse, orderResponse, userResponse, 0);
                return;

            }

        },
        function (companyResponse, orderResponse, userResponse, customFieldResponse, callback) {

            if (orderResponse == 0) {

                orderService.orderParams = {
                    advertiserId: companyResponse.id,
                    name: orderName,
                    userId: userResponse.id,
                    trackNo: trackingNumber,
                    teamName: teamName,
                    customFieldValues: customFieldResponse
                };

                orderService.createOrder(function (err, createOrderResponse) {

        
                    if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while createOrder!");    
                        callback(errorCount, errorBox);
                        return;

                    }

                    var restClientObj = new restClient();
                        restClientObj.requestName = 'orders';
                    var dfpOrderId = createOrderResponse.rval[0].id;
                        restClientObj.requestData = readyOrders.id + '?dfp_order_id=' + dfpOrderId + '&requestType=UPDATE_DFP_NO';

                        restClientObj.updateData(function (err, result) {

                        callback(null, companyResponse, createOrderResponse.rval[0]);
                        return;

                    });
                });

            } else {

                callback(null, companyResponse, orderResponse); //customFieldResponse => 0, createOrderResponse => 0
                return;

            }
        },

        /*  userResponse and customFieldResponse has been no longer use for bellow functionality,
         *  so it just droped here
         *    
         */
        function (companyResponse, orderResponse, callback) {

            console.log("orderId=>", orderResponse.id);

            if (data.name != '') {

                var whereLineItem = "WHERE name = '" + data.name + "'";

            } else {

                var whereLineItem = "WHERE OrderId = '" + orderResponse.id + "'";

            }

            lineItemService.queryStatement = whereLineItem + " ORDER BY Id LIMIT 0,20";

            lineItemService.getLineItemsByStatement(function (err, lineItemresponse) {

                    
                    if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getLineItemsByStatement!");                         
                        callback(errorCount, errorBox);
                        return;

                    }
                    
                    
                if (lineItemresponse.hasOwnProperty('rval') && lineItemresponse.rval.totalResultSetSize != 0) {

                    var restClientObj = new restClient();
                        restClientObj.requestName = 'line-items';
                    var dfpLineId = lineItemresponse.rval.results[0].id;
                        restClientObj.requestData = data.line_id + '?dfp_line_id=' + dfpLineId + '&requestType=UPDATE_DFP_NO';

                        restClientObj.updateData(function (err, result) {});

                        callback(null, companyResponse, orderResponse, lineItemresponse.rval.results[0]);
                        return;

                } else {

                    callback(null, companyResponse, orderResponse, 0);
                    return;
                }

            });
        },
        function (companyResponse, orderResponseDetails, lineItemresponse, callback) {

            var lineItemObj = new LineItem();

            var date = data.start_date.split(" ");
            var time = date[1];
                date = date[0].split("-");
                time = time.split(":");

            var startDateTime = {};
    
                startDateTime.date = {year:date[0], month:date[1], day:date[2]};
                startDateTime.hour = time[0];
                startDateTime.minute = time[1];
                startDateTime.second = time[2];
                startDateTime.timeZoneID = 'America/Los_Angeles';

                date = data.end_date.split(" ");
                time = date[1];
                date = date[0].split("-");
                time = time.split(":");

            var endDateTime = {};

                endDateTime.date = {year:date[0], month:date[1], day:date[2]};;
                endDateTime.hour = time[0];
                endDateTime.minute = time[1];
                endDateTime.second = time[2];
                endDateTime.timeZoneID = 'America/Los_Angeles';    

            var lineItemType = data.lineItemType;
                lineItemObj.orderId = parseInt(orderResponseDetails.id);

            if (data.dfp_line_item_id != '' && data.dfp_line_item_id != null) {

                lineItemObj.id = data.dfp_line_item_id;

            }
            
            var startDateAndTimeType = 'USE_START_DATE_TIME';

            var currentDate = convertDate(new Date( new Date().addHours(7)));
            var startDate = convertDate(new Date(new Date(data.start_date)));
                currentDate = new Date(currentDate).getTime();
                startDate = new Date(startDate).getTime();
            
             if (startDate <= currentDate) {

                 startDateAndTimeType = 'IMMEDIATELY';

             } 
             
                lineItemObj.name = data.name;
                lineItemObj.startDateTime = startDateTime;
                lineItemObj.startDateTimeType = startDateAndTimeType; // check startDate <= current date put it IMMEDIATELY;
                lineItemObj.endDateTime = endDateTime;
                lineItemObj.creativeRotationType = 'OPTIMIZED';
                lineItemObj.lineItemType = lineItemType.toUpperCase();


            var costPUnit = new Money();
                costPUnit.currencyCode = 'USD'; // defined CURRENCY_CODE constant 
                costPUnit.microAmount = data.costPerUnit * 1000000;//2000000;
                lineItemObj.costPerUnit = costPUnit;
                lineItemObj.costType = data.costType;


                 var roadblock_type = '';

            if (lineItemType == 'CREATIVE_SET') {

                 roadblock_type = 'CREATIVE_SET';
             var creative_placeholders = data.creativePlaceHolders.split(",");

            } else {
                
                var creative_placeholders = data.creativePlaceHolders.split(",");
            }

            var creative_size = creative_placeholders[0].split("x");

            var image_width = creative_size[0];//300;//creative_size[0]; // change
            var image_height = creative_size[1];//250//creative_size[1]; // change
        
            if (roadblock_type == '') {

                if (image_width == '1' && image_height == '1') {

                        creative_placeholders = {size:{width:image_width, height:image_heightm, isAspectRatio:false}, creativeSizeType:'INTERSTITIAL'};

                } else {
                   
                    var sizes = creative_placeholders;
                    var creative_placeholders = [];

                    for (var i in sizes) {

                        if (sizes[i] == 'Out of page (INTERSTITIAL)') {
                        
                            creative_placeholders_size = ["1", "1"];

                        } else {

                            creative_placeholders_size = sizes[i].split('x');

                        }

                    var creative_size = new Size();
                        creative_size.width = creative_placeholders_size[0];
                        creative_size.height = creative_placeholders_size[1];
                        creative_size.isAspectRatio = false;

                    var creative_placeholder = new CreativePlaceHolder();
                        creative_placeholder.size = creative_size;

                        if (sizes[i] == 'Out of page (INTERSTITIAL)') {

                            creative_placeholder.creativeSizeType = 'INTERSTITIAL';
                           
                        }

                        creative_placeholders.push(creative_placeholder);
                    }

                }
            } else if (roadblock_type == 'MULTI') {

                var creative_placeholders_array = new Array();

                for (var i in creative_placeholders) {

                    var isInterstitial = false;

                    if (creative_placeholders[i] == 'Out of page (INTERSTITIAL)') {
                      
                        isInterstitial = true;
                        var creative_placeholders_size = ["1", "1"];

                    } else {
                        
                        var creative_placeholders_size = creative_placeholders[i].split('x');

                    }

                    var creative_size = new Size();
                        creative_size.width = creative_placeholders_size[0];
                        creative_size.height = creative_placeholders_size[1];
                        creative_size.isAspectRatio = false;
                    var creative_placeholder = new CreativePlaceHolder();
                        creative_placeholder.size = creative_size;

                    if (isInterstitial)
                        creative_placeholder.creativeSizeType = 'INTERSTITIAL';

                        creative_placeholders_array.push(creative_placeholder);
                }

                creative_placeholders = creative_placeholders_array;

            } else {
               
                var creative_placeholders_array = array();
                var creative_placeholder_master = new CreativePlaceHolder();

                for (var i in creative_placeholders) {

                    if (creative_placeholders[i] == 'Out of page (INTERSTITIAL)') {
                        var creative_size = new Size();
                            creative_size.width = 1;
                            creative_size.height = 1;
                            creative_size.isAspectRatio = false;
                    
                    } else {

                        var creative_placeholders_size = creative_placeholders[i].split('x');
                        var creative_size = new Size();
                            creative_size.width = creative_placeholders_size[0];
                            creative_size.height = creative_placeholders_size[1];
                            creative_size.isAspectRatio = false;
                    }

                    if (i == 0) {

                        creative_placeholder_master.size = creative_size;

                        if (creative_placeholders[i] == 'Out of page (INTERSTITIAL)') {

                            creative_placeholder_master.creativeSizeType = 'INTERSTITIAL';

                        }

                    } else {

                        var creative_placeholder = new CreativePlaceHolder();
                            creative_placeholder.size = creative_size;
                            creative_placeholder_master.companions.push(creative_placeholder);

                    }
                }

                creative_placeholders_array.push(creative_placeholder_master);
                creative_placeholders = creative_placeholders_array;
            }

            if (roadblock_type != '' && roadblock_type != 'MULTI') {

                lineItemObj.roadblockingType = roadblock_type;
                lineItemObj.companionDeliveryOption = 'ALL';

            }
            
            lineItemObj.creativePlaceholders = creative_placeholders;
            lineItemObj.allowOverbook = true;

            var goal = new Goal();          

            if (data.lineItemType == 'House') {

                goal.goalType = "DAILY";

            } else if (data.costType == 'CPD') {

                goal.goalType = "DAILY";

            } else {

                goal.goalType = "LIFETIME";

            }
            
            goal.unitType = 'IMPRESSIONS';
            goal.units = data.unitsBought;

            //lineItemObj.notes = "demo";//data.comments;
            lineItemObj.primaryGoal = goal;

            if (data.lineItemType != 'SPONSORSHIP') {

                goal.units = data.unitsBought;

            } else {

                goal.units = 100;

            }

            var restClientObj = new restClient();
                restClientObj.requestName = 'line-items';
                restClientObj.requestData = data.line_id + '?requestType=GET_TARGETS';
            var target = restClientObj.getData();

             // if lineitem have no targets, 
           
            
            var targeting = new Array();
            var excluded_targeting = new Array();
            var custom_targets = {};
            var deviceTargets = new Array();
            var placementTargets = new Array();
            var arrayOne = new Array();
            var arrayTwo = new Array();
            var custom_target_array = new Array();


             if (target.length == 0) {

                callback(null, companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders);
                return;

            }
            
            for (var m in target) {

                if (target[m].target_type == 1 || target[m].lts_exclude != 1) {

                    targeting.push(target[m].value);

                }

                if (target[m].target_type == '1' && target[m].lts_exclude == '1') {

                    excluded_targeting.push(target[m].value);

                } else if (target[m].target_type == '2' && target[m].grp_cond != 0) {

                    arrayOne = [];
                    arrayTwo = [];
                    arrayOne.push(target[m].value);
                    arrayTwo[target[m].custom_target_type] = arrayOne;
                    custom_targets[target[m].grp_cond] = arrayTwo;

                } else if (target[m].target_type == '4') {

                    deviceTargets.push(target[m].value);

                    
                } else if (target[m].target_type == '6') {

                    placementTargets.push(target[m].value);
                    
                }
            }
        
           
            var adunit_id = new Array();
            
            for (var j in targeting) {

                var p_adunit_id_arr = targeting[j].split('~');

                if (p_adunit_id_arr[1] == '1') {

                    adunit_id[p_adunit_id_arr[0]] = true;

                } else {

                    adunit_id[p_adunit_id_arr[0]] = false;

                }
            }


            var placement_id = new Array();
            
            for (var k in placementTargets) {

                var p_placement_id_arr = placementTargets[k].split('~');

                if (p_placement_id_arr[1] == '1') {

                      placement_id[p_placement_id_arr[0]] = true;

                } else {

                      placement_id[p_placement_id_arr[0]] = false;
                }
            }

            var exclude_adunit_id = new Array();
            
            for (var a in excluded_targeting) {

                var p_adunit_id_arr = excluded_targeting[a].split('~');

                if (p_adunit_id_arr[0] == '1') {

                    exclude_adunit_id[p_adunit_id_arr[0]] = true;

                } else {

                    exclude_adunit_id[p_adunit_id_arr[0]] = false;

                }
            }


            var ad_unit_array = new Array();

            for (var i in adunit_id) {

                var ad_units = new AdUnitTargeting();
                    ad_units.adUnitId = i;//68647329;//Replace 68647329 with i on live
                    ad_units.includeDescendants = 1;
                    ad_unit_array.push(ad_units);
            }

            var placement_array = new Array();

            for (var j in placement_id) {

                placement_array.push(j);

            }

            var exclude_ad_unit_array = new Array();

            for (var j in exclude_adunit_id) {

                var ad_units = new AdUnitTargeting();

                    ad_units.adUnitId = j;
                    ad_units.includeDescendants = exclude_adunit_id[j];

                    exclude_ad_unit_array.push(ad_units);

            }


            var location = new Array();
                location.push({'id':2826});

            var geo_targeting = new GeoTargeting();
                geo_targeting.targetedLocations = location;

            var targeting = new Targeting();

                targeting.geoTargeting = geo_targeting;
                targeting.inventoryTargeting = {'targetedAdUnits':ad_unit_array, 'excludedAdUnits': exclude_ad_unit_array, 'targetedPlacementIds':placement_array};


            var ids = new Array();
            var mainLen = Object.keys(custom_targets).length;
            var mainCount = 0;

            if (mainLen == 0) {

                callback(null, companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders);
                return;

            }

            for (var i in custom_targets) {

                (function (i) {

                        var iLen = Object.keys(custom_targets[i]).length;
                        var iCount = 0;

                    for (var j in custom_targets[i]) {

                        (function (j) {

                            if (j != 'Audience Segment') {

                               var whereCond = '';
                                if (j != '') {
                                     whereCond = " where displayName='" + j + "' and type='PREDEFINED' ";
                                }

                                //displayName = any one(Position,Demographic,Behavioural,Contextual, Site type)
                                                              
                                customTargetingService.queryStatement = whereCond;

                                customTargetingService.getCustomTargetingKeysByStatement(function (err, result) {

                                        iCount++;
                                    if (iCount == iLen)
                                        mainCount++;

                                    var id = '';

                                    if (result.hasOwnProperty('rval') && result.rval.totalResultSetSize > 0)
                                        id = result.rval.results[0].id;
                                    var ijCount = 0;
                                    var ijLen = custom_targets[i][j].length;
                                    
                                    for (var k in custom_targets[i][j]) {

                                        var innerData = custom_targets[i][j][k];
                                            innerData = innerData.split(",");
                                        var len = innerData.length;
                                        var count = 0;
                                        for (var m in innerData) {

                                            (function (m) {

                                                var cond = " WHERE status='ACTIVE'"

                                                if (id != '') {

                                                     cond = "WHERE customTargetingKeyId='" + id + "' AND status = 'ACTIVE'";

                                                    if (innerData[j] != '') {

                                                        //   cond = cond + " AND name='"+innerData[m]+"' AND matchType='EXACT'"; //don't remove

                                                    }   

                                                } 
                                                customTargetingService.queryStatement = cond;
                                                
                                                customTargetingService.getCustomTargetingValuesByStatement(function (err, result) {

                                                     count++;

                                                     if (count == len)
                                                         ijCount++;

                                                    if (err) {
                                                        
                                                        errorCount = 1;
                                                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getCustomTargetingValuesByStatement!");
                                                        callback(errorCount, errorBox);
                                                        return;

                                                    }
                                                    else if (result.hasOwnProperty('rval') && result.rval.totalResultSetSize > 0){
                                                       
                                                      
                                                        ids.push(result.rval.results[0].id);

                                                    }
                                                   

                                                   if (ijLen == ijCount && len == count && id != '' && ids.length > 0) {
                                
                                            
                                                            var custom_target = {};
                                                                custom_target.attributes = {'xsi:type':'CustomCriteria'};
                                                                custom_target.keyId = id;
                                                                custom_target.valueIds = ids;
                                                                custom_target.operator = 'IS';
                                                                custom_target_array.push(custom_target);

                                                                ids = []; //make array as empty
                                                        
                                                    }

                                                    if (mainCount == mainLen) {

                                                        mainCount = 0;// notify callback function exit;
                                                        callback(null, companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders);
                                                        return;
                                                    }

                                                });
                                            })(m);
                                        }

                                    }

                                });
                            } else if (j == 'Audience Segment') {


                                    var ijCount = 0;
                                    var ijLen = custom_targets[i][j].length;

                                    for(var k in custom_targets[i][j]) {

                                        (function(k){

                                         var innerData = custom_targets[i][j][k];
                                             innerData = innerData.split(",");
                                         var len = innerData.length;
                                         var count = 0;

                                         for (var m in innerData) {

                                            (function(m){

                                            var whereCond = " WHERE status='ACTIVE' "
                                            
                                            if (innerData[m] != '') {

                                                whereCond = " WHERE name LIKE '"+innerData[m]+"' and status='ACTIVE' ";
                                            } 

                                            whereCond = whereCond + " LIMIT 100";


                                        audienceSegmentService.queryStatement = whereCond;

                                        audienceSegmentService.getAudienceSegmentsByStatement(function(err, result){

                                                count++;

                                                if (len == count) {
                                                    ijCount++
                                                    mainCount++;
                                                }
                                                
                                                
                                                if (err) {

                                                    errorCount = 1;
                                                    errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while getCustomTargetingValuesByStatement!");
                                                    callback(errorCount, errorBox);
                                                    mainCoun = 0;
                                                    return;    

                                                } else {

                                                     ids.push(result.rval.results[0].id);
                                                }

                                               
                                                if (ijCount = ijLen && len == count && ids.length > 0) {

                                                        var custom_target = {};
                                                            custom_target.attributes = {'xsi:type':'AudienceSegmentCriteria'};
                                                            custom_target.audienceSegmentIds = ids;
                                                            custom_target.operator = 'IS';
                                                            custom_target_array.push(custom_target);
                                                            ids = [];
                                                    
                                                }  

                                                if (mainCount == mainLen) {

                                                    mainCoun = 0;
                                                    callback(null, companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders);
                                                    return;
                                                }         
                                        }); 

                                        })(m);

                                         }

                                       })(k);  
                                    }
                            }

                        })(j);
                    }
                })(i);
            }
        },
        function (companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders, callback) {

            
              if (custom_target_array.length > 0) {

                    var top_set = {};
                    var sub_set = {};

                    sub_set.attributes = {'xsi:type':'CustomCriteriaSet'};
                    sub_set.logicalOperator = "AND";
                    sub_set.children = custom_target_array;

                    top_set.attributes = {'xsi:type':'CustomCriteriaSet'};
                    top_set.logicalOperator = "OR";
                    top_set.children = [custom_target_array[0], sub_set];

                    targeting.customTargeting = top_set;
            }

    
           
            lineItemObj.targeting = targeting;
            lineItemObj.creativePlaceholders = creative_placeholders;

            lineItemService.args = lineItemObj;


            if (lineItemresponse == 0) {

                lineItemService.createLineItems(function (err, lineItemResult) {
                                        
                    if (err) {
                        
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while creating createLineItems!");
                        callback(errorCount, errorBox);
                        return; 

                    } else if (lineItemResult.hasOwnProperty('rval') && lineItemResult.rval.totalResultSetSize != 0) {

                        var restClientObj = new restClient();
                            restClientObj.requestName = 'line-items';
                        var dfpLineId = lineItemResult.rval[0].id;
                            restClientObj.requestData = data.line_id + '?dfp_line_id=' + dfpLineId + '&requestType=UPDATE_DFP_NO';
                            restClientObj.updateData(function (err, result) {

                            callback(null, companyResponse, orderResponseDetails, lineItemResult.rval[0], custom_target_array, targeting, lineItemObj, creative_placeholders);
                            return;

                        });
                    }  else {

                        errorCount = 1;
                        errorBox.push("No proper data handling from DFP@Error occured while creating createLineItems!");
                        callback(errorCount, errorBox);
                        return; 

                    }                     

                });

            } else {

                    lineItemService.updateLineItems(function (err, lineItemResult) {

                    if (err) {
                        errorCount = 1;
                        errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while creating updateLineItems!");
                        callback(errorCount, errorBox);
                        return; 
                    }
                    else {

                          callback(null, companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders);
                          return;

                    }

                });

            }

        },
        function (companyResponse, orderResponseDetails, lineItemresponse, custom_target_array, targeting, lineItemObj, creative_placeholders, callback) {


            console.log("dfpLineId=>", lineItemresponse.id);

            var restClientObj = new restClient();
                restClientObj.requestName = 'line-items';
                restClientObj.requestData = data.line_id + '?requestType=GET_CREATIVES';
            var creativesData = restClientObj.getData();


                var fileContent = null;
                var creativesArray = new Array();
                var creativeLen = creativesData.length;
                var creativeCount = 0;
                

            for(var i in creativesData) {

            
              if(creativesData[i].lc_creative_type == 'Image') {


                     var html_tmp_path = JDX_JOB_PATH + data.line_order_id + '/' + creativesData[i].lc_creative; //change
                     //var html_tmp_path = JDX_JOB_PATH+'RSW0064775-ADS-75304_C1_300x250.GIF';

                     var dimensions = sizeOf(html_tmp_path);
       
                        fileContent = fs.readFileSync(html_tmp_path);  
                
                            var primary_image_asset = {

                                'attributes':{'xsi:type': 'CreativeAsset'},
                                'assetByteArray': new Buffer(fileContent).toString('base64'),
                                'fileName': creativesData[i].lc_creative
                            }

                            var creative = {

                                'attributes':{'xsi:type': 'ImageCreative'},
                                'advertiserId': companyResponse.id,
                                'name': creativesData[i].lc_creative,
                                'size':{width:dimensions.width, height:dimensions.height, isAspectRatio:false},
                                'destinationUrl': creativesData[i].lc_creative_link,
                                'overrideSize':false,
                                'primaryImageAsset':  primary_image_asset 

                            }

                            creativesArray.push(creative);
                  
              }

              if (creativesData[i].lc_creative_type == "HTML5") {


                    var parser = new htmlparser.Parser({
                        onopentag: function (name, attribs) {
                            if (name === "div" && attribs.id === "swiffycontainer") {

                                var styleData = attribs.style;
                                    styleData = styleData.split(";").join(":").split(":");

                                    width = styleData[1].replace('px', '');
                                    height = styleData[3].replace('px', '');
                                
                            }
                        }

                    }, {decodeEntities: true});
                    parser.write(creativesData[i].lc_html_snippet);
                    //parser.write('<!doctype html><html><head></head><body><div id="swiffycontainer" style="width: 300px; height: 250px"></div></body></html>');
                    parser.end();

                    var creative = {

                            'attributes':{'xsi:type': 'CustomCreative'},
                            'advertiserId': companyResponse.id,
                            'name': creativesData[i].lc_creative,
                            'size': {'width': width, 'height': height, isAspectRatio:false},
                            'destinationUrl': creativesData[i].lc_creative_link,
                            'htmlSnippet': creativesData[i].lc_html_snippet
                        }

                        creativesArray.push(creative);
                } 
        }


        var template_file_name = '';   
  
            if(data.isTemplateOrder == 1) {

                var image_width = 1;
                var image_height = 1;

                restClientObj.requestName = 'line-items';
                restClientObj.requestData = data.line_id + '?requestType=GET_TEMPLATE_CREATIVES';
                var templateCreatives = restClientObj.getData();


                var temPlateArray = {};
                var creativeTemplateValues = null;
                var template_name = '';

                    if (templateCreatives != '')
                         var template_name = templateCreatives[0].template_name;


                for (i in templateCreatives) {

                    temPlateArray[templateCreatives[i].ctf_name] = templateCreatives[i].lc_creative;

                }

                creativeTemplateService.queryStatement = "WHERE name = '"+template_name+"' AND status = 'ACTIVE'";

                creativeTemplateService.getCreativeTemplatesByStatement(function(err, result){

                if(result.hasOwnProperty('rval') && result.rval.totalResultSetSize > 0) {


                var variables = result.rval.results[0].variables;
                var template_id = result.rval.results[0].id;

                var creativeTemplateVariableValues = [];

                for (var j in variables) {

                    if (variables[j].hasOwnProperty('choices')) {

                        creativeTemplateValues = {};//new StringCreativeTemplateVariableValue();
                        creativeTemplateValues.attributes = {'xsi:type': 'StringCreativeTemplateVariableValue'};
                        creativeTemplateValues.uniqueName = variables[j].uniqueName;
                        creativeTemplateValues.value = temPlateArray[variables[j].label];

                    }

                    else if (variables[j].hasOwnProperty('mimeTypes')) {

                        if (temPlateArray[variables[j].label] != undefined) { 

                            template_file_name = temPlateArray[variables[j].label];

                        }

                        creativeTemplateValues = {};//new AssetCreativeTemplateVariableValue();
                        var assetCreative = new CreativeAsset();

                        fileContent = fs.readFileSync(JDX_JOB_PATH+data.line_order_id+'/'+temPlateArray[variables[j].label]); //change
                        //fileContent = fs.readFileSync(JDX_JOB_PATH+'RSW0064775-ADS-75304_C1_300x250.GIF'); // ***

                        assetCreative.assetByteArray = new Buffer(fileContent).toString('base64');
                        assetCreative.fileName = temPlateArray[variables[j].label];

                        creativeTemplateValues.attributes = {'xsi:type':'AssetCreativeTemplateVariableValue'};
                        creativeTemplateValues.uniqueName = variables[j].uniqueName;
                        creativeTemplateValues.asset = assetCreative;
                        

                    }  else if(variables[j].hasOwnProperty('isTrackingUrl')) {
                        creativeTemplateValues = {};//new UrlCreativeTemplateVariableValue();

                        creativeTemplateValues.attributes = {'xsi:type':'UrlCreativeTemplateVariableValue'};
                        creativeTemplateValues.uniqueName = variables[j].uniqueName;
                        creativeTemplateValues.value = temPlateArray[variables[j].label];

                    } else {

                            creativeTemplateValues = {};//new StringCreativeTemplateVariableValue();
                            creativeTemplateValues.attributes = {'xsi:type':'StringCreativeTemplateVariableValue'};

                            if (variables[j].uniqueName.indexOf("height") != -1 || variables[j].uniqueName.indexOf("width") != -1) {

                                creativeTemplateValues = {};//new LongCreativeTemplateVariableValue();
                                creativeTemplateValues.attributes = {'xsi:type':'LongCreativeTemplateVariableValue'};

                            }
                                creativeTemplateValues.uniqueName = variables[j].uniqueName;

                                creativeTemplateValues.value = temPlateArray[variables[j].label];
                    }

                        creativeTemplateVariableValues.push(creativeTemplateValues);

                }

                var creative = {};

                creative.attributes = {'xsi:type': 'TemplateCreative'};
                creative.advertiserId = companyResponse.id;
                creative.name = template_file_name;
                creative.size = {width: 1, height: 1, isAspectRatio: false};

                    creative.creativeTemplateId = template_id;

                    creative.creativeTemplateVariableValues = creativeTemplateVariableValues;

                    creativesArray.push(creative); 

                    callback(null, companyResponse, lineItemresponse, creativesArray);
                    return;

                } else if(err) {

                    errorCount = 1;
                    errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured in getCreativeTemplatesByStatement");
                    callback(errorCount, errorBox);
                    return;  
                }

                else {

                    callback(null, companyResponse, lineItemresponse, 0);
                    console.log("getCreativeTemplatesByStatement result not found", result);
                    done('getCreativeTemplatesByStatement result not found', data);
                    return;

                }    
                });

            } else {

                callback(null, companyResponse, lineItemresponse, creativesArray);
                return;
            }

    },

    function(companyResponse, lineItemresponse, creativesArray, callback) {

            var creativeIds = new Array();

             creativeService.args = {creatives:creativesArray};

            creativeService.createCreatives(function(err, result){

                if (err) {

                    errorCount = 1;
                    errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while creating Creatives");
                    callback(errorCount, errorBox);  
                    return; 

                }
                else if (result == null) {

                    errorCount = 1;
                    errorBox.push("dfp returned null result, while createCreatives");
                    callback(errorCount, errorBox);  
                    return; 

                }
                else {

                    result = result.rval;

                    for(var i in result) {

                        creativeIds.push(result[i].id);

                    } 

                    callback(null, companyResponse, lineItemresponse, creativeIds);
                    return;
                }
            });     
    },

    
    function(companyResponse, lineItemresponse, creativeIds, callback) {

            var creativeAssoData = new Array();
        
            lineItemCreativeAssociationService.args = "WHERE lineItemId = '"+lineItemresponse.id+"'";

            lineItemCreativeAssociationService.getLineItemCreativeAssociationsByStatement(function(err, result){
          

         // if (result.hasOwnProperty('rval') && result.rval.totalResultSetSize == 0) {

            for(var i in creativeIds) {

                creativeAssoData.push({lineItemId:lineItemresponse.id, creativeId:creativeIds[i]});    

            }  

              lineItemCreativeAssociationService.args = creativeAssoData;

              lineItemCreativeAssociationService.createLineItemCreativeAssociations(function(err, lineItemAssocResult){
    

               if(err) {
                    
                    errorCount = 1;
                    errorBox.push(err['root'].Envelope.Body.Fault.faultstring+"@Error occured while createLineItemCreativeAssociations!");
                    callback(errorCount, errorBox);    
                    return;         
               }
                
                else {

                  callback(null, companyResponse, lineItemresponse, lineItemAssocResult);
                  return;
                   
                }
                
          });


          ///} else console.log("RESULT", result);


         console.log("DONE", "creativeIds", creativeIds, "ID", lineItemresponse.id);

          
    });

    },
    function(companyResponse, lineItemresponse, lineItemAssocResult, callback) {

                if (errorCount == 0) {

                    restClientObj = new restClient();
                    restClientObj.requestName = 'line-items';
                    restClientObj.requestData = data.line_id+'?requestType=UPDATE_STATUS';
                    restClientObj.updateData(function (err, result) {});  

                    console.log("Final Update", errorCount, errorBox);  
                    reportDfpError = 0;  
                    done(null, data);
                    return; 

                } else {

                    callback(errorCount, errorBox);
                    return;
                }

               
    }
    ], function (errorCount, errorBox) {

        restClientObj = new restClient();
        restClientObj.requestName = 'line-items';
        restClientObj.requestData = '?line_id=' + data.line_id;
        restClientObj.requestBody = errorBox;
        restClientObj.createData(function (err, result) {});
        
        reportDfpError = 0;
        done(new Error(errorBox));
        return
    });
});

/*queue.on( 'error', function( err ) {

        fs.appendFile('./logs/dfp_push_error_log.txt', err+'\n\n', function(error) {

            if (reportDfpError == 1){

                   reportDone("failed@runtime Exception Occured in Queue: jobValidationLineItem-"+reportLineItemId+"and Message: "+err);
                    return;
            }

        });        
});*/

queue.on('job enqueue', function (id, type) {

    if (type == 'push-to-dfp') {
        kue.Job.get(id, function (err, job) {
            console.log(type+' queued job', job.data.trackingNo);
            // conn.query('UPDATE lineitems SET li_status = ? WHERE line_id = ?', ['Q', job.data.line_id], function (err, results) {});
        });
   }

}).on('job start', function (id, result) {

    kue.Job.get(id, function (err, job) {
        //console.log("Job started", job.data, job.data.line_id);
    });
}).on('job failed', function (errorMessage) {

    // console.log("failed", errorMessage);

});


function Size(){};

function AudienceSegmentTargeting(){};

function AssetCreativeTemplateVariableValue(){};

function StringCreativeTemplateVariableValue(){};

function UrlCreativeTemplateVariableValue(){};

function CreativeAsset(){};

function CreativeTemplate(){};

var Creative = function() {

    if (this.constructor === Creative) {
      throw new Error("Can't instantiate abstract class!");
    }

};

Creative.prototype.setAdvertiserId = function(id) {

    this.advertiserId = id;
    return this;

};


Creative.prototype.setName = function(name) {

    this.name = name;
    return this;

};

Creative.prototype.setSize = function() {

  var size = new Size();
      size.width = 300;
      size.height = 250;
      size.isAspectRatio = false;

      this.size = size;
      return this;

};


var HasDestinationUrlCreative = function() {

if (this.constructor === HasDestinationUrlCreative) {
      throw new Error("Can't instantiate abstract class!");
    }

    Creative.apply(this, arguments);
};


HasDestinationUrlCreative.prototype = Object.create(Creative.prototype);

HasDestinationUrlCreative.prototype.setDestinationUrl = function(url) {

        this.destinationUrl = url;
        return this;  

};

HasDestinationUrlCreative.prototype.constructor = HasDestinationUrlCreative;


var CustomCreative = function() {

    var setHtmlSnippet = null;

    HasDestinationUrlCreative.apply(this, arguments);
  
};

CustomCreative.prototype = Object.create(HasDestinationUrlCreative.prototype);


CustomCreative.prototype.setHtmlSnippet = function(html) {

      this.htmlSnippet = html;

};

function ImageCreative(){};

CustomCreative.prototype.constructor = CustomCreative;



function DateTime() {};

function Size() {};

function CreativePlaceHolder() {};

function Money() {};

function AdUnits() {};

function CustomTargeting() {};

function Goal() {};

function AudienceSegmentTargeting() {};

function AudienceSegmentCriteria() {};

//function CustomCriteriaSet() {};

function AdUnitTargeting() {};

function CountryLocation() {};

function GeoTargeting() {};

function Targeting() {};

function LineItem() {};

class CustomCriteriaNode
{

}

class CustomCriteriaSet extends CustomCriteriaNode
{

};

class CustomCriteriaLeaf extends CustomCriteriaNode
{

};

class CustomCriteria extends CustomCriteriaLeaf
{

};
