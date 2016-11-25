'use strict';
var P = require('bluebird')
var cradle
var api = require('./api')
var sessionToken = null  //We only need one for all the workers
var sessionTokenName = ''
var username = ''
var password = ''

exports.setClient = function(client){
  cradle = client
}

exports.setSessionTokenName = function(name){
  sessionTokenName = name
}

exports.setUsername = function(uname){
  username = uname
}

exports.setPassword = function(pwd){
  password = pwd
}

exports.setSessionToken = function(token){
  sessionToken=token
}

var getConfig = function(name){
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

var get = exports.get = function(name){
  return getConfig(name).then(function(workerCfg){
    if(!workerCfg) return null
    return construct(workerCfg)
  })
}

function construct(config){
  var that = {}
  var request = api.worker(config)

  that.request = request
  that.contentExist = function(handle,file){
    return request.postAsync({
      url: request.url('/job/content/exists'),
      json: {
        handle: handle,
        file: file
      }
    }).spread(function(res,body){
      if(body.error) throw new Error(body.error)
      return !!body.exists
    })
  }

  that.contentDownloadURL = function(handle,file){
    return 'https://' + config.host + ':' + config.port +
      '/job/content/download/' + handle + '/' + file
  }

  if(sessionToken){
    request=api.setSession(sessionToken,request,sessionTokenName)
    return that
  }else{
    return that
  }
}

/**
 * Authenticate the session
 * @param {string} username
 * @param {string} password
 * @return {P}
 */
function login (worker){
  return worker.request.postAsync({
    url: worker.request.url('/login'),
    json: {
      username: username,
      password: password
    }
  })
  .spread(function(res,body){
    if(!body.session)
      throw new Error('Login failed, no session')
    sessionToken = body.session
    return sessionToken
  })
}
