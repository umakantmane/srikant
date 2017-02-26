var kue = require('kue')
  ,  sizeOf = require('image-size')
  ,  htmlparser = require("htmlparser2")
  ,  restClient = require('../models/restClient')
  ,  requestSyn = require('sync-request')
  ,  unique = require('array-unique')
  ,  fs = require("fs");
const appconfig = require('appconfig');
appconfig.load();

var queue = kue.createQueue({redis: appconfig.constant.REDIS_CONNECTION_STRING});
    queue.watchStuckJobs(120000);



queue.process('lineitems', function (job, done) {

     var restClientObj = new restClient();
         restClientObj.requestName = 'line-items';
         restClientObj.requestData = job.data.line_id+'?requestType=GET_LINEITEM';
    var  data = restClientObj.getData();

    console.log("lineId:", data.line_id);

    reportJobValidationError = 1;
    reportValidationDone = done;
    jobValidationLineItem = data.line_id;

    var errors = new Array();
    var errorsDesc = new Array();

    if (data.creativePlaceHolders == '') {
        errors.push(9);
        errorsDesc.push("Creative size mismatch");
    }

    if (data.start_date == '' || data.start_date == '0000-00-00 00:00:00') {
        errors.push(19);
        errorsDesc.push("Start date missing");
    }    

    if (data.end_date == '' || data.end_date == '0000-00-00 00:00:00') {
        errors.push(20);
        errorsDesc.push("End date missing");
    }

    if (data.name == '') {
        errors.push(21);
        errorsDesc.push("Lineitem name missing"); 
    }

    if (data.costPerUnit == '' || data.costPerUnit == null || data.costPerUnit == 0) {

            errors.push(22);
            errorsDesc.push("CPM/CPD is missing");
    }

    if ((data.start_date != '' && data.start_date != '0000-00-00 00:00:00') && (data.end_date != '' && data.end_date != '0000-00-00 00:00:00')) {

        var endDate = new Date(data.end_date);
        var currentDate = new Date();
            endDate = endDate.getTime();
            currentDate = currentDate.getTime();

        if (endDate < currentDate) {
            errors.push(8);
            errorsDesc.push("Date in past");
        }
    } 

    if (data.isTemplateOrder == 0) {

        var restClientObj = new restClient();
            restClientObj.requestName = 'line-items';
            restClientObj.requestData = data.line_id + '?requestType=GET_CREATIVES';

        var result = restClientObj.getData();

        if (result == '') {

            errors.push(3);
            errorsDesc.push("Creative missing");

        } else {

            var crSize = new Array();

            for (var i in result) {

                var advertLink = result[i].lc_creative_link;
                var lcCreative = result[i].lc_creative;

                if (advertLink == '' || advertLink == null) {

                    errors.push(1);
                    errorsDesc.push("Url missing");


                } else {

                    if (advertLink.indexOf('http://') == -1 && advertLink.indexOf('https://') == -1)
                        advertLink = 'http://'+advertLink;

                    var testUrl = JDTRAFFIC_WS_URL + "/line-items?requestType=FILE_URI&fileUri=" + advertLink;

                    var res = requestSyn('GET', testUrl);
                        res = JSON.parse(res.getBody('utf8'));

                    if (res.data.statusCode == 404) {

                        errors.push(2);
                        errorsDesc.push("Url incorrect");
                        
                    }

                }

                if (lcCreative == "" || lcCreative == null) {
                    
                    errors.push(3);
                    errorsDesc.push("Creative missing");

                }

                var creativeType = result[i].lc_creative_type;

                if (creativeType == "Image") {
                    
                    var html_tmp_path = JDX_JOB_PATH+data.line_order_id + '/' + lcCreative;//change  

                    var dimensions = sizeOf(html_tmp_path);

                    crSize.push(dimensions.width + 'x' + dimensions.height);
                    dimensions = dimensions.width+'x'+dimensions.height;

                    if (dimensions.indexOf(data.creativePlaceHolders) == -1) {

                         errors.push(4);
                         errorsDesc.push("Creative incorrect");
                    }

                }

                if (creativeType == "HTML5") {

                    var parser = new htmlparser.Parser({
                        onopentag: function (name, attribs) {
                            if (name === "div" && attribs.id === "swiffycontainer") {

                                var data = attribs.style;
                                    data = data.split(";").join(":").split(":");

                                var width = data[1].replace('px', '');
                                var height = data[3].replace('px', '');
                                    crSize.push(width + 'x' + height);
                            }
                        }

                    }, {decodeEntities: true});
                    parser.write(result[i].lc_html_snippet);
                    parser.end();

                }

            }

        }
    }


    if (data.creativePlaceHolders.indexOf("Out of page (INTERSTITIAL)") != -1 || data.isTemplateOrder != 0) {

        var restClientObj = new restClient();
            restClientObj.requestName = 'line-items';
            restClientObj.requestData = data.line_id + '?requestType=GET_TEMPLATE_CREATIVES';
        var templateCreativeResult = restClientObj.getData();

        if (templateCreativeResult != '') {


            for (var k in templateCreativeResult) {

                if (templateCreativeResult[k].fieldType == 'url' && templateCreativeResult[k].ctf_is_optional == 0) {

                    var advertLink = templateCreativeResult[k].lc_creative;

                    if (advertLink == "" || advertLink == null) {

                        errors.push(1);
                        errorsDesc.push("Url missing");

                    } else {

                        if (advertLink.indexOf('http://') == -1 && advertLink.indexOf('https://') == -1)
                            advertLink = 'http://'+advertLink;

                        var testUrl = JDTRAFFIC_WS_URL + "/line-items?requestType=FILE_URI&fileUri=" + advertLink;

                        var res = requestSyn('GET', testUrl);
                            res = JSON.parse(res.getBody('utf8'));

                        if (res.data.statusCode == 404) {

                            errors.push(2);
                            errorsDesc.push("Url incorrect");

                        }

                    }

                }

                if (templateCreativeResult[k].fieldType == 'file' && templateCreativeResult[k].lc_creative == "" && templateCreativeResult[k].ctf_is_optional == 0) {

                    errors.push(3);
                    errorsDesc.push("Creative missing");

                }

                if (data.product == 3 && templateCreativeResult[k].field_id == 1) {

                    //var html_tmp_path = './ganesh.jpg'; //local path
                    var html_tmp_path = JDX_JOB_PATH+data.line_order_id + '/' + templateCreativeResult[k].lc_creative; //change
                    
                    var dimensions = sizeOf(html_tmp_path);
                    var crSize = dimensions.width + 'x' + dimensions.height;

                    if (dimensions.width != "1280") {

                        errors.push(4);
                        errorsDesc.push('Creative incorrect');
                    }

                }

                if (data.product == 6 && templateCreativeResult[k].field_id == 16) {

                      //var html_tmp_path = './ganesh.jpg'; //local path 
                      var html_tmp_path = JDX_JOB_PATH+data.line_order_id + '/' + templateCreativeResult[k].lc_creative; //change

                      var dimensions = sizeOf(html_tmp_path);

                    var crSize = dimensions.width + 'x' + dimensions.height;

                    if (crSize != "960x250") {

                        errors.push(4);
                        errorsDesc.push("Creative incorrect");

                    }

                }


                if (data.product == 39 && templateCreativeResult[k].field_id == 10) {

                    //var html_tmp_path = './ganesh.jpg'; //local path
                    var html_tmp_path = JDX_JOB_PATH+data.line_order_id + '/' + templateCreativeResult[k].lc_creative;
                    var dimensions = sizeOf(html_tmp_path);
                    var crSize = dimensions.width + 'x' + dimensions.height;

                    if (crSize != "320x50") {

                        errors.push(4);
                        errorsDesc.push("Creative incorrect");

                    }

                }

            }

        }

    }

    var restClientObj = new restClient();
        restClientObj.requestName = 'line-items';
        restClientObj.requestData = data.line_id + '?requestType=GET_TARGETS';

    var target = restClientObj.getData();

    var targetMissing = true;

    for (var m in target) {

        if (target[m].target_type == 1 || target[m].target_type == 6) { // 1 => Ad Units, 6 => Placements
            targetMissing = false;

            if (target[m].target_name == "") {
                targetMissing = true;
            }
        }
    }


    if (targetMissing == true) {

        errors.push(5);
        errorsDesc.push("Targeting missing");
    }
    
    restClientObj.requestName = 'orders';
    restClientObj.requestData = data.line_order_id + '?requestType=GET_ORDER_DETAIL';

    var orders = restClientObj.getData();
    var trackNo = orders.trackNo;

   if (trackNo == '' || trackNo == null) {

        errors.push(10); //URN missing
        errorsDesc.push("URN/trackNo missing");

    } else if(!trackNo.match(/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]*$/i)) {

        errors.push(10); //URN missing or not alphanumeric
        errorsDesc.push("URN/trackNo Non-alphanumeric");

    } 

    if (orders.ordSalesRepEmail == '' || orders.ordSalesRepEmail == null) {

        errors.push(13); //Sales Rep Email missing
        errorsDesc.push("Sales rep email missing");

    }

    if (orders.advertiserName == '' || orders.advertiserName == null) {

        errors.push(14); //Client missing
        errorsDesc.push("Client name missing")

    }

   /* var OrderAdvertLink =  orders.OrderAdvertLink;

    if (OrderAdvertLink == '' || OrderAdvertLink == null) {

        errors.push(1);//Customer Advert link
        errorsDesc.push("Url Missing");

     } else {

        if (OrderAdvertLink.indexOf('http://') == -1 && OrderAdvertLink.indexOf('https://') == -1)
            OrderAdvertLink = 'http://'+OrderAdvertLink;

        var testUrl = JDTRAFFIC_WS_URL + "/line-items?requestType=FILE_URI&fileUri=" +OrderAdvertLink;
        var res = requestSyn('GET', testUrl);
            res = JSON.parse(res.getBody('utf8'));

        if (res.data.statusCode == 404) {

            errors.push(2);
            errorsDesc.push("Url incorrect");

        }
    }*/

    var orderBudget = orders.budget;

    if (orderBudget == '' || orderBudget == null || orderBudget == 0) {

        errors.push(17);
        errorsDesc.push('Net price missing');

    } else if(!orderBudget.match(/^\d+(?:\.\d{1,5})?$/)) {

        errors.push(18);
        errorsDesc.push('Net price incorrect/non-numeric');
        
    }
    
    restClientObj.requestName = 'line-items';
    restClientObj.requestData = data.line_id + '?requestType=GET_PRICE_CONDITIONS';

    var price = restClientObj.getData();
    var products = [];
    var price_condition = [];
    var cond = new Array();


    for (var n in price) {

        if (price[n].costType == 'budget') {

            products.push(price[n].productId);
            cond[price[n].productId] = price[n].cost;
        }

        if (price[n].costType == 'CPM') {

            products.push(price[n].productId);
            cond[price[n].productId] = price[n].cost;

        }
    }

    

    if (inArray(products, data.product)) {

            if (orders.budget < cond[data.product] && orders.siteId != 359 && orders.siteId != 360) {
                errors.push(6);
                errorsDesc.push("Net price is less than minimum value");
            }

            if ((data.costPerUnit !='' && data.costPerUnit != null) && data.costPerUnit < cond[data.product] && orders.siteId != 359 && orders.siteId != 360) {
                errors.push(6);
                errorsDesc.push("Net price is less than minimum value");
            }
    }

    if (!inArray(products, data.product)) {
              
            if (orders.siteId != 359 && orders.siteId != 360 && data.product != 1 && orders.budget < 20) {

                errors.push(6);
                errorsDesc.push("Net price is less than minimum value");

            }
               
    }   
      
    var restClientObj = new restClient();

        restClientObj.requestName = 'orderstatuscycles';
        restClientObj.requestData = data.line_id+'?oscToStatus='+(errors.length > 0)?1:0;
        restClientObj.updateData(function (err, result) {});

    if (errors.length == 0) {

        restClientObj.requestName = 'line-items';
        restClientObj.requestData = data.line_id;
        restClientObj.updateData(function (err, result) {});
        reportJobValidationError = 0;
        done(null, data); // job completed  successfully
        return;


    } else {

        restClientObj.requestName = 'line-items';
        restClientObj.requestData = '?line_id=' + data.line_id;
        restClientObj.requestBody = unique(errors);
        restClientObj.createData(function (err, result) {});
        reportJobValidationError = 0;
       
        done('Errors:'+unique(errorsDesc).join(",")); // job failed
        return;

    }

});



/*queue.on( 'error', function( err ) {

        fs.appendFile('./logs/job_validation_error_log.txt', err+'\n\n', function(error) {

            if (reportJobValidationError == 1){

                   reportValidationDone("failed@runtime Exception By Queue: jobValidationLineItem-"+jobValidationLineItem+"and Message: "+err);
                    return;
            }

        });        
});*/


queue.on('job enqueue', function (id, type) {

   
    if (type == 'lineitems') {
       
        kue.Job.get(id, function (err, job) {
            var jobData = job.data;    
            var restClientObj = new restClient();
                restClientObj.requestName = 'orderstatuscycles';
                restClientObj.requestData = '?line_id='+jobData.line_id;
                restClientObj.requestBody = {oscLineId:jobData.line_id, oscFromStatus:jobData.lineStatus,oscUserid:USER_EMAIL_ID};
                restClientObj.createData(function (err, result) {});

        });

    } 

}).on('job start', function (id, type) {

    if (type == 'lineitems') {
        kue.Job.get(id, function (err, job) {
            var jobData = job.data;    
            var restClientObj = new restClient();
                restClientObj.requestName = 'orderstatuscycles';
                restClientObj.requestData = jobData.line_id;
                restClientObj.updateData(function (err, result) {});
        });
  }  

})/*.on('job failed', function (errorMessage) {

    console.log("failed", errorMessage);

})*/;

/*.on('job complete', function(id, result){
 
 console.log(id, result.line_id);
 
 })*/



function inArray(array,item) {

    return (array.indexOf(item) != -1);

}





