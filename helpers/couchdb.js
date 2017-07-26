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
  if(config.options.auth && config.options.auth.username){
    dsn = dsn + config.options.auth.username
    var couchPassword = 'password'
    if(config.options.auth.password !== '')
      couchPassword = config.options.auth.password
    dsn = dsn + ':' + couchPassword
    dsn = dsn + '@'
  }
  dsn = dsn + config.host
  dsn = dsn + ':' + config.port
  console.log(dsn)
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
