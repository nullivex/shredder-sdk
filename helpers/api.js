'use strict';
var P = require('bluebird')
var oose = require('oose-sdk')

var NetworkError = oose.NetworkError
var UserError = oose.UserError

var cache = {}

var config = {
  maxSockets: 8,
  sessionTokenName: 'X-Shredder-Token',
  master: {
    port: 5980,
    host: '127.0.0.1',
    username: 'shredder',
    password: 'shredder'
  },
  worker: {
    port: 5981,
    host: '127.0.0.1',
    username: 'shredder',
    password: 'shredder'
  }
}

var pool = {maxSockets: config.maxSockets}


/**
 * Update API Config
 * @param {object} update
 */
exports.updateConfig = function(update){
  var cfg = new ObjectManage()
  cfg.$load(config)
  cfg.$load(update)
  config = cfg.$strip()
  pool.maxSockets = config.maxSockets
}


/**
 * Setup master access
 * @param {object} options
 * @return {request}
 */
exports.master = function(options){
  if(!options) options = config.master
  return setupRequest('master',options)
}


/**
 * Worker access
 * @param {object} options
 * @return {request}
 */
exports.worker = function(options){
  if(!options) options = config.worker
  return setupRequest('worker',options)
}


/**
 * Set session on any request object
 * @param {object} session
 * @param {request} request
 * @return {request}
 */
exports.setSession = function(session,request){
  var cacheKey = request.options.type + ':' + request.options.host +
    ':' + request.options.port + ':' + session.token
  if(!cache[cacheKey]){
    debug('cache miss',cacheKey)
    var newOptions = {headers: {}}
    newOptions.headers[config.sessionTokenName] = session.token
    var req = request.defaults(newOptions)
    req = extendRequest(req,request.options.type,request.options)
    cache[cacheKey] = req
  } else {
    debug('cache hit',cacheKey)
  }
  return cache[cacheKey]
}
