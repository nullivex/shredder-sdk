'use strict';
var Password = require('node-password').Password

var nano


/**
 * Generate job Handle
 * @return {string}
 */
var generateHandle = function(){
  return new Password({length: 12, special: false}).toString()
}


/**
 * Get Job by Handle
 * @param {string} handle
 * @return {P}
 */
exports.getByHandle = function(handle){
  return nano.shredder.getAsync(handle)
    .then(function(jobRes){
      if(!handle) return {}
      return jobRes
    },function(err){
      throw err
    })
}


/**
 * Save Job instance
 * @param {Object} jobInstance
 * @return {P}
 */
exports.save = function(jobInstance){
  if(!jobInstance.handle) jobInstance.handle = generateHandle()
  return nano.shredder.insertAsync(jobInstance,jobInstance.handle)
    .then(function(result){
      jobInstance._rev = result.rev
      jobInstance._id = jobInstance.handle
      return jobInstance
    })
}


/**
 * Remove a job
 * @param {object} jobInstance
 * @return {P}
 */
exports.remove = function(jobInstance){
  return nano.shredder.destroyAsync(jobInstance._id, jobInstance._rev)
    .then(function(){
      return true
    },function(err){
      throw err
    })
}


/**
 * Set couchdb client
 * @param {object} client
 */
exports.setClient = function(client){
  nano = client
}
