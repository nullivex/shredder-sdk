'use strict';
var nano


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
  if(jobInstance._id){
    return nano.shredder.insertAsync(jobInstance)
      .then(function(result){
        jobInstance._rev = result.rev
        return jobInstance
      },function(err){
        throw err
      })
  } else {
    return nano.shredder.insertAsync(jobInstance)
      .then(function(job){
        //here we add the handle now that we know it
        jobInstance._id = job.id
        jobInstance._rev = job.rev
        jobInstance.handle = job.id
        //and save again to preserve the handle property
        return nano.shredder.insertAsync(jobInstance)
          .then(function(job){
            //freshen the instance and return
            jobInstance._id = job.id
            jobInstance._rev = job.rev
            return jobInstance
          })
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
