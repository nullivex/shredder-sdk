'use strict';
var expect = require('chai').expect
var oose = require('oose-sdk')

var api = require('../../helpers/api')
var mock = require('../../mock')
var NetworkError = oose.NetworkError
var pkg = require('../../package.json')
var UserError = oose.UserError

//load promises here
//var P = require('bluebird')
//P.longStackTraces() //enable long stack traces for debugging only


/**
 * API Timeout for outage testing
 * @type {number}
 */
process.env.REQUEST_TIMEOUT = 10000


/**
 * Store user session
 * @type {object}
 */
exports.user = {
  username: mock.user.username,
  password: mock.user.password,
  session: {}
}


/**
 * Store purchase
 * @type {object}
 */
exports.purchase = {}


/**
 * Check if a host is up
 * @param {string} type
 * @param {object} server
 * @return {Function}
 */
exports.checkUp = function(type,server){
  return function(){
    var client = api[type](server[type])
    return client.postAsync({url: client.url('/ping'), timeout: 50})
      .spread(function(res,body){
        expect(body.pong).to.equal('pong')
      })
  }
}


/**
 * Check if a host is down
 * @param {string} type
 * @param {object} server
 * @return {Function}
 */
exports.checkDown = function(type,server){
  return function(){
    var client = api[type](server[type])
    return client.postAsync({url: client.url('/ping'), timeout: 50})
      .then(function(){
        throw new Error('Server not down')
      })
      .catch(Error,client.handleNetworkError)
      .catch(NetworkError,function(err){
        expect(err.message).to.match(/ECONNREFUSED|ETIMEDOUT/)
      })
  }
}


/**
 * Check if public routes work on a prism
 * @param {object} master
 * @return {Function}
 */
exports.checkPublic = function(master){
  return function(){
    var client = api.prism(master.master)
    return client
      .postAsync(client.url('/'))
      .spread(client.validateResponse())
      .spread(function(res,body){
        expect(body.message).to.equal(
          'Welcome to Shredder Mock version ' + pkg.version)
        return client.postAsync(client.url('/ping'))
      })
      .spread(client.validateResponse())
      .spread(function(res,body){
        expect(body.pong).to.equal('pong')
        return client.postAsync(client.url('/user/login'))
      })
      .spread(client.validateResponse())
      .spread(function(res,body){
        console.log(body)
        throw new Error('Should have thrown an error for no username')
      })
      .catch(UserError,function(err){
        expect(err.message).to.equal('No user found')
      })
  }
}


/**
 * Check if protected routes require authentication on a prism
 * @param {object} master
 * @return {Function}
 */
exports.checkProtected = function(master){
  return function(){
    var client = api.prism(master.master)
    return client.postAsync(client.url('/user/logout'))
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/user/password/reset'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/user/session/renew'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/create'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/detail'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/update'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/remove'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/start'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/retry'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
        return client.postAsync(client.url('/job/abort'))
      })
      .catch(UserError,function(err){
        expect(err.message).to.match(/Invalid response code \(401\) to POST/)
      })
  }
}


/**
 * Login to master
 * @param {object} master
 * @return {Function}
 */
exports.masterLogin = function(master){
  return function(){
    var client = api.master(master.master)
    return client.postAsync({
      url: client.url('/user/login'),
      json: {
        username: exports.user.username,
        password: exports.user.password
      },
      localAddress: '127.0.0.1'
    })
      .spread(function(res,body){
        expect(body.session).to.be.an('object')
        return body.session
      })
  }
}


/**
 * Logout of master
 * @param {object} master
 * @param {object} session
 * @return {Function}
 */
exports.masterLogout = function(master,session){
  return function(){
    var client = api.setSession(session,api.master(master.master))
    return client.postAsync({
      url: client.url('/user/logout'),
      localAddress: '127.0.0.1'
    })
      .spread(function(res,body){
        expect(body.success).to.equal('User logged out')
      })
  }
}


/**
 * Job create
 * @param {object} master
 * @return {Function}
 */
exports.jobCreate = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/create'),
      localAddress: '127.0.0.1',
      json: {
        category: mock.job.category,
        description: mock.job.description,
        priority: mock.job.priority
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.priority).to.equal(mock.job.priority)
        expect(body.category).to.equal(mock.job.category)
      })
  }
}


/**
 * Job detail
 * @param {object} master
 * @return {Function}
 */
exports.jobDetail = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/detail'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.priority).to.equal(mock.job.priority)
        expect(body.category).to.equal(mock.job.category)
        expect(body.status).to.equal(mock.job.status)
      })
  }
}


/**
 * Job update
 * @param {object} master
 * @return {Function}
 */
exports.jobUpdate = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/update'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle,
        priority: 5
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.priority).to.equal(5)
      })
  }
}


/**
 * Job remove
 * @param {object} master
 * @return {Function}
 */
exports.jobRemove = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/remove'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle
      }
    })
      .spread(function(res,body){
        expect(body.success).to.equal('Job removed')
        expect(body.count).to.equal(1)
      })
  }
}


/**
 * Job Start
 * @param {object} master
 * @return {Function}
 */
exports.jobStart = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/start'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.status).to.equal('queued')
      })
  }
}


/**
 * Job Retru
 * @param {object} master
 * @return {Function}
 */
exports.jobRetry = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/retry'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.status).to.equal('queued_retry')
      })
  }
}


/**
 * Job Abort
 * @param {object} master
 * @return {Function}
 */
exports.jobAbort = function(master){
  return function(){
    var client = api.setSession(exports.user.session,api.master(master.master))
    return client.postAsync({
      url: client.url('/job/abort'),
      localAddress: '127.0.0.1',
      json: {
        handle: mock.job.handle
      }
    })
      .spread(function(res,body){
        expect(body.handle).to.equal(mock.job.handle)
        expect(body.status).to.equal('queued_abort')
      })
  }
}
