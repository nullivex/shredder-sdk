'use strict';
var P = require('bluebird')
var dns = require('dns')
var ObjectManage = require('object-manage')
var oose = require('oose-sdk')

var api = require('./api')
var UserError = oose.UserError

//make some promises
P.promisifyAll(dns)



/**
 * Prism Public Interaction Helper
 * @param {object} opts
 * @constructor
 */
var Shredder = function(opts){
  //setup options
  this.opts = new ObjectManage({
    username: '',
    password: '',
    master: {
      host: null,
      port: 5980
    }
  })
  this.opts.$load(opts)
  //set properties
  this.api = {}
  this.authenticated = false
  this.connected = false
  this.session = {}
}


/**
 * Check if we are connected
 * @return {boolean}
 */
Shredder.prototype.isConnected = function(){
  return this.connected
}


/**
 * Check if we are authenticated
 * @return {boolean}
 */
Shredder.prototype.isAuthenticated = function(){
  return this.authenticated
}


/**
 * Select a prism and prepare for connection
 * @param {string} host
 * @param {number} port
 * @return {P}
 */
Shredder.prototype.connect = function(host,port){
  var that = this
  return P.try(function(){
    if(host) that.opts.master.host = host
    if(port) that.opts.master.port = port
    that.connected = true
    that.api = api.master(that.opts.master)
    return host
  })

}


/**
 * Authenticate the session
 * @return {P}
 */
Shredder.prototype.login = function(){
  var that = this
  return that.api.postAsync({
    url: that.api.url('/user/login'),
    json: {
      username: that.opts.username,
      password: that.opts.password
    }
  })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      if(!body.session)
        throw new UserError('Login failed, no session')
      that.session = body.session
      that.authenticated = true
      return that.session
    })
    .catch(that.api.handleNetworkError)
}


/**
 * Prepare call and renew session if needed
 * @param {object} request
 * @param {object} session
 * @return {P}
 */
Shredder.prototype.prepare = function(request,session){
  var that = this
  if(!request) request = that.api
  if(!session) session = that.session
  var client = api.setSession(session,request,'X-Shredder-Token')
  return P.try(function(){
    if(!that.isConnected()) throw new UserError('Not connected')
    if(!that.isAuthenticated()) throw new UserError('Not authenticated')
    if((+new Date(that.session.expires)) > ((+new Date() + 300))){
      return client
    } else {
      var expires = (+new Date()) + 360000 //add 1 hour
      return client.postAsync({
        url: client.url('/user/session/renew'),
        json: {
          expires: expires
        }
      })
        .spread(client.validateResponse())
        .spread(function(res,body){
          that.session = session = body.session
          return client
        })
        .catch(client.handleNetworkError)
    }
  })
}


/**
 * Logout
 * @return {P}
 */
Shredder.prototype.logout = function(){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/user/logout')
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      that.authenticated = false
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Reset your password
 * @return {P}
 */
Shredder.prototype.passwordReset = function(){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/user/password/reset')
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job create
 * @param {object} description
 * @param {number} priority
 * @param {string} category
 * @return {P}
 */
Shredder.prototype.jobCreate = function(description,priority,category){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/create'),
        json: {
          description: JSON.stringify(description),
          priority: priority || null,
          category: category || 'resource'
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job detail
 * @param {string} handle
 * @return {P}
 */
Shredder.prototype.jobDetail = function(handle){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/detail'),
        json: {
          handle: handle
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job Update
 * @param {string} handle
 * @param {object} changes
 * @return {P}
 */
Shredder.prototype.jobUpdate = function(handle,changes){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/update'),
        json: changes
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job remove
 * @param {string} handle
 * @return {P}
 */
Shredder.prototype.jobRemove = function(handle){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/remove'),
        json: {
          handle: handle
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job Start
 * @param {string} handle
 * @return {P}
 */
Shredder.prototype.jobStart = function(handle){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/start'),
        json: {
          handle: handle
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job Retry
 * @param {string} handle
 * @return {P}
 */
Shredder.prototype.jobRetry = function(handle){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/retry'),
        json: {
          handle: handle
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Job Abort
 * @param {string} handle
 * @return {P}
 */
Shredder.prototype.jobAbort = function(handle){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/abort'),
        json: {
          handle: handle
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return body
    })
    .catch(that.handleNetworkError)
}


/**
 * Check if job content exists
 * @param {string} handle
 * @param {string} file
 * @return {P}
 */
Shredder.prototype.jobContentExists = function(handle,file){
  var that = this
  var client = {}
  return that.prepare()
    .then(function(result){
      client = result
      return client.postAsync({
        url: client.url('/job/content/exists'),
        json: {
          handle: handle,
          file: file
        }
      })
    })
    .spread(that.api.validateResponse())
    .spread(function(res,body){
      return !!body.exists
    })
    .catch(that.handleNetworkError)
}


/**
 * URL to download job content
 * @param {string} handle
 * @param {string} file
 * @return {string}
 */
Shredder.prototype.jobContentUrl = function(handle,file){
  var that = this
  return 'https://' + that.opts.master.host + ':' + that.opts.master.port +
    '/job/content/download/' + handle + '/' + file
}


/**
 * Export Shredder
 * @type {Shredder}
 */
module.exports = Shredder
