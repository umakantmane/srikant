    "use strict";
var express = require("express")
  , ui = require('kue-ui')
  , app = express()
  , debug = require('debug')('server')
  , kue = require('kue')
  , logger = require('morgan')
  , fs = require('fs')
  , db = require("./config/db");
  
  
   /*
    * runtime exceptions tracking global variables
   */

   Object.assign(global, {reportDfpError:0, reportJobValidationError:0, reportDone:null, reportValidationDone:null, reportLineItemId:null, jobValidationLineItem:null});
   db.initDb();
   //app.use(logger('dev'));
   kue.app.set('title', '2adpro queuesManager');
   require("./cronTab/setAccesstoken");

  const PORT = process.env.PORT || 8082;
  const BASE_ULR = process.env.BASE_ULR || "http://localhost:"+PORT;
  
  ui.setup({
      apiURL: '/api', // IMPORTANT: specify the api url
      baseURL: '/kue', // IMPORTANT: specify the base url
      updateInterval: 60000 // Optional: Fetches new data every 5000 ms
  });

  require("./routes/routes")(app);
  require("./routes/kueRoute")(app);
  require('./workers/pushToDfpWorkers');
  require('./workers/validationWorkers');

  app.use('/api', kue.app);
  app.use('/kue', ui.app);

  /*
    in the bellow function catching uncaughtException and saving into errorLog.txt file
  */

  process.on('uncaughtException', function (err) {  

    var errorMessage = err.stack || err.message;

     var filePath = './logs/default.txt';

     if (reportDfpError == 1)
        filePath = "./logs/dfp_push_error_log.txt";
     if (reportJobValidationError == 1)
        filePath = "./logs/job_validation_error_log.txt"; 
     
    fs.appendFile(filePath, errorMessage+'\n\n\n\n\n', function(error) {

        if (reportDfpError == 1) {
              reportDone("failed@runtime Exception: lineItem-"+reportLineItemId+"and Message: "+errorMessage);
              return;
        } else if (reportJobValidationError == 1){
                reportValidationDone("failed@runtime Exception: jobValidationLineItem-"+jobValidationLineItem+"and Message: "+errorMessage);
                return;
        } else {
          
          console.log(errorMessage);
          process.exit(1);

         } 
    });     
  });

app.listen(PORT, function(){
    
    console.log("Server running on "+BASE_ULR);

});

