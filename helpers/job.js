'use strict';
var P = require('bluebird')
var Password = require('node-password').Password
var cradle

exports.generateHandle = function(){
  return new Password({length: 12, special: false}).toString()
}


exports.save = function(jobInstance){
  return cradle.db.saveAsync(jobInstance._id, jobInstance._rev,jobInstance).then(function(job){
    return job
  },function(err){
    throw err
  })
}

exports.getByHandle = function(handle){
  return cradle.db.viewAsync('jobs/by_handle', {key:handle})
    .then(function(jobRes){
      return (jobRes.length)?jobRes[0].value:null
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