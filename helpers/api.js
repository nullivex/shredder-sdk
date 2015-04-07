'use strict';
var ObjectManage = require('object-manage')
var oose = require('oose-sdk')

var api = oose.api

var config = {
  maxSockets: 8,
  sessionTokenName: 'X-Shredder-Token',
  rejectUnauthorized: false,
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
api.updateConfig(config)

var pool = {maxSockets: config.maxSockets}


/**
 * Export API
 * @type {Object}
 */
module.exports = api


/**
 * Parent config update
 * @type {Function}
 */
api.parentUpdateConfig = api.updateConfig


/**
 * Update API Config
 * @param {object} update
 */
api.updateConfig = function(update){
  var cfg = new ObjectManage()
  cfg.$load(config)
  cfg.$load(update)
  config = cfg.$strip()
  pool.maxSockets = config.maxSockets
  api.parentUpdateConfig(config)
}


/**
 * Setup master access
 * @param {object} options
 * @return {request}
 */
api.master = function(options){
  if(!options) options = config.master
  return api.setupRequest('master',options)
}


/**
 * Worker access
 * @param {object} options
 * @return {request}
 */
api.worker = function(options){
  if(!options) options = config.worker
  return api.setupRequest('worker',options)
}
