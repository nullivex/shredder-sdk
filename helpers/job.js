'use strict';
var nano


/**
 * Get Job by Handle
 * @param {string} handle
 * @return {P}
 */
var getByHandle = exports.getByHandle = function(handle){
  return nano.db.getAsync(handle)
    .then(function(jobRes){
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
var save = exports.save = function(jobInstance){
  if(jobInstance._id){
    return nano.shredder.insertAsync(jobInstance,jobInstance._rev)
      .then(function(job){
        return getByHandle(job.id)
      },function(err){
        throw err
      })
  } else {
    return nano.shredder.insertAsync(jobInstance)
      .then(function(job){
        jobInstance._id = jobInstance.handle = job._id
        jobInstance._rev = job._rev
        return save(jobInstance)
      },function(err){
        throw err
      })
  }
}


/**
 * Remove a job
 * @param {object} jobInstance
 * @return {P}
 */
exports.remove = function(jobInstance){
  return nano.db.destroyAsync(jobInstance._id, jobInstance._rev)
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
