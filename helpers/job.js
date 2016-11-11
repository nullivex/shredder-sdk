'use strict';
var P = require('bluebird')
var cradle


var save = exports.save = function(jobInstance){
  if(jobInstance._id){
    return cradle.db.saveAsync(jobInstance._id,jobInstance._rev,jobInstance).then(function(job){
      return getByHandle(job.id)
    },function(err){
      throw err
    })
  }else{
    return cradle.db.saveAsync(jobInstance).then(function(job){
      jobInstance._id = jobInstance.handle = job._id
      jobInstance._rev = job._rev
      return save(jobInstance)
    },function(err){
      throw err
    })
  }
}

var getByHandle = exports.getByHandle = function(handle){
  return cradle.db.getAsync(handle)
    .then(function(jobRes){
      return jobRes
    },function(err){
      throw err
    })
}

exports.remove = function(jobInstance){
  return cradle.db.removeAsync(jobInstance._id, jobInstance._rev).then(function(){
    return true
  },function(err){
    throw err
  })
}

exports.setClient = function(client){
  cradle = client
}