'use strict';
var util = require('util')



/**
 * MaxConcurrencyError Error Object
 * @param {string} message
 * @constructor
 */
var MaxConcurrencyError = function(message){
  Error.apply(this,arguments)
  this.message = '' + message
}
util.inherits(MaxConcurrencyError,Error)


/**
 * Export the Error
 * @type {Function}
 */
module.exports = MaxConcurrencyError
