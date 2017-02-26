define("define-constant/1.0.0/index-debug", [], function(require, exports, module) {
  // 定义常量
  // 2014年7月20日15:59:18
  'use strict';
  module.exports = function(CONSTANT) {
    CONSTANT = CONSTANT || Object.create(null);
    return function(key, val) {
      var temp = {};
      if (arguments.length === 2) {
        temp[key] = val;
        key = temp;
      }
      for (var i in key) {
        _define(CONSTANT, i, key[i]);
      }
      return CONSTANT;
    };
  };
  //////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////// [ private ] ////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  /**
   * 定义一个常量
   * @param  {Object} parent 父级对象容器
   * @param  {String} key    字段
   * @param  {*}      val    字段值
   * @version 1.0
   * 2014年7月20日16:18:53
   */
  function _define(parent, key, val) {
    Object.defineProperty(parent, key, {
      // 是否可被修改、不能被删除
      configurable: false,
      // 是否可被数值运算符修改
      writable: false,
      // 是否可被枚举
      enumerable: true,
      // 值
      value: val,
    });
    // 值是对象
    // {
    //    a: 1,
    //    b: 2
    // }
    if (typeof(val) === 'object' && val.constructor === Object) {
      for (var i in val) {
        _define(parent[key], i, val[i]);
      }
    }
  }
});