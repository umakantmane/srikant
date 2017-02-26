# define-constant[![NPM version](https://img.shields.io/npm/v/define-constant.svg?style=flat)](https://npmjs.org/package/define-constant)[![spm version](http://spmjs.io/badge/define-constant)](http://spmjs.io/package/define-constant)

define constant in nodejs or window


#USAGE

## 1. nodejs
```
global.CONFIG = {};
var constant = require('define-constant')(global.CONFIG);

constant('a', 1);
constant('b', {
	a: 1,
	b: 2
});
```

## 2. window
```
window.CONFIG = {};
var constant = require('define-constant')(window.CONFIG);

constant('a', 1);
constant('b', {
	a: 1,
	b: 2
});
```
