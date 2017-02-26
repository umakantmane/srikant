     "use strict";
      
var mysql = require('mysql')
  , fs = require('fs')
  , xmlParse = require('xml-parser');

 var appConfig = module.exports; 

appConfig.getConnection = function(){
	
	  var dbCon =  mysql.createConnection({		
	  host     : DB_HOST,
	  user     : DB_USER,
	  password : DB_PWD,
	  database : DB_NAME
	});
	
	 dbCon.connect();	
	  global.conn = dbCon; 
     
};


appConfig.initDb = function() {

		var data = fs.readFileSync('./conf/conf.xml', 'utf8');
		//var data = fs.readFileSync('./config/config.xml', 'utf8'); //change
		    data = xmlParse(data);
			data = data.root.children;	

		for(var i in data) {

			global[data[i].name] = data[i].content

		}
		//this.getConnection();
};


