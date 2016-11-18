'use strict';
var P = require('bluebird')
var cradle
var api = require('./api')
var sessionToken = null

exports.setClient = function(client){
  cradle = client
}

var get = exports.get = function(name){
  return cradle.db.viewAsync('workers/all',{key:name})
    .then(function(jobRes){
      if(jobRes && jobRes.length){
        return jobRes[0].value
      }else{
        return null
      }
    },function(err){
      throw err
    })
}

var getAvailable = exports.getAvailable = function(){
  return cradle.db.viewAsync('workers/available')
    .then(function(jobRes){
      var result = []
      if(jobRes && jobRes.length){
        for(var i=0;i<jobRes.length ; i++){
          result.push(jobRes[i].value)
        }
      }
      return result
    },function(err){
      throw err
    })
}