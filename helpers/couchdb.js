'use strict';
var P = require('bluebird')
var nano = require('nano')

//make some promises
P.promisifyAll(nano)


/**
 * Export client
 * @param {object} config
 * @return {object} client
 */
module.exports = function(config){
  //setup our client
  var dsn = config.protocol || 'http://'
  if(config.auth && config.auth.username){
    dsn = dsn + config.auth.username
    var couchPassword= 'password'
    if(config.auth.password !== '')
      couchPassword = config.auth.password
    dsn = dsn + ':' + couchPassword
    dsn = dsn + '@'
  }
  dsn = dsn + config.host
  dsn = dsn + ':' + config.port
  var client = nano(dsn)

  //make some promises
  P.promisifyAll(client)


  /**
   * Setup the DB access
   * @type {object}
   */
  client.shredder = P.promisifyAll(client.db.use(config.database || 'shredder'))

  return client
}
