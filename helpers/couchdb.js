'use strict';
var P = require('bluebird')
var cradle = require('cradle')

var CouchSchema = require('./couch/CouchSchema')

var config = require('../config')
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
    config.couchdb.host,
    config.couchdb.port,
    config.couchdb.options
  )

  //make some promises
  P.promisifyAll(client)


  /**
   * Setup the DB access
   * @type {object}
   */
  client.db = P.promisifyAll(client.database(config.couchdb.database))


  /**
   * Add schema to helper
   * @type {CouchShema}
   */
  client.schema = new CouchSchema(config.couchdb.prefix)

  return client
}
