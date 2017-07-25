'use strict';
var request = require('request-promise')
var couchLoginUrl


/**
 * Set config for session
 * @param {string} host
 * @param {string} port
 * @param {boolean} secure
 */
exports.setConfig = function(host,port,secure){
  host = host||'localhost'
  couchLoginUrl =
    (secure) ? 'https://' : 'http://' +
    host + ':' +
    port + '/_session'
}


/**
 * User Login
 * @param {object} username
 * @param {object} password
 * @this couchSession
 * @return {P}
 */
exports.login = function(username,password){
  //redis.incr(redis.schema.counter('prism','user:login'))
  var sessionToken
  //make a login request to couch db
  if(!username || !password){
    throw new Error('Invalid username or password')
  } else {
    return request({
      url: couchLoginUrl,
      method: 'POST',
      resolveWithFullResponse: true,
      json: true,
      //headers: {
      //  HOST: config.couchdb.host + ':' + config.couchdb.port
      //},
      body: {
        name: username,
        password: password
      }
    })
      .then(function(result){
        //i would think we are going to get a 401 for bad logins and then 200
        //for good logins, we will find out
        if(200 !== result.statusCode)
          throw new Error('Invalid login response ' + result.statusCode)
        //need our session token from the session
        if(!result.headers['set-cookie'])
          throw new Error('No cookie sent in response')
        //now i think we need to query the session itself
        sessionToken = result.headers['set-cookie'][0].split(';')[0]
        return request({
          url: couchLoginUrl,
          json: true,
          method: 'GET',
          resolveWithFullResponse: true,
          headers: {
            Cookie: sessionToken
          }
        })
      })
      .then(function(result){
        if(200 !== result.statusCode){
          throw new Error(
            'Failed to query session information ' + result.body.toJSON())
        }
        //establish session?
        return {
          success: 'User logged in',
          session: {
            token: sessionToken,
            ip: '',
            data: result.body
          }
        }
      })
      .catch(function(err){
        if(401 === err.statusCode){
          throw new Error('Invalid username or password')
        } else {
          console.log(err,err.stack)
          throw new Error('Login failed with an error')
        }
      })
  }
}


/**
 * User Logout
 * @param {string} token
 */
exports.logout = function(token){
  //make a logout request to couch db
  request({
    url: couchLoginUrl,
    method: 'DELETE',
    json: true,
    headers: {
      Cookie: token
    }
  }).then(function(body){
    return body
  })
  .catch(function(err){
    //redis.incr(redis.schema.counterError('prism','user:logout'))
    throw new Error(err.message)
  })
}
