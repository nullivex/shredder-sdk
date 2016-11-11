'use strict';
var P = require('bluebird')
var cradle = require('cradle')

var client = null
//make some promises
P.promisifyAll(cradle)

//setup our client

/**
 * Export client
 * @return {object} client
 */
module.exports = function(config){
  if(client) return client;

  client = new (cradle.Connection)(
    config.host,
    config.port,
    config.options
  )

  //make some promises
  P.promisifyAll(client)


  /**
   * Setup the DB access
   * @type {object}
   */
  client.db = P.promisifyAll(client.database(config.database))

  return client
}
