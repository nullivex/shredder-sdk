'use strict';
var mockCouch = require('mock-couch');
var P = require('bluebird')
var couchInstance

/**
 * Start oose mock
 * @param {number} port
 * @param {string} host
 * @return {P}
 */
exports.start = function(port,host){
  return new P(function(resolve,reject){
    couchInstance = mockCouch.createServer()
    couchInstance.listen(port)
    couchInstance.addDB('mock_shredder',[])
    resolve(true)
  })
}


/**
 * Stop oose prism
 * @return {P}
 */
exports.stop = function(){
   return new P(function(resolve,reject){
    couchInstance.close()
    resolve(true)
  })
}
