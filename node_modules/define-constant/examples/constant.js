'use strict';

global.CONFIG = {};
var constant = require('../index.js')(global.CONFIG);

constant('a', 1);
constant('b', {
	a: 1,
	b: 2
});


console.log(global.CONFIG);
