'use strict';
var mockCouch = require('mock-couch');
var mockWorker = require('./helpers/worker')
var P = require('bluebird')
var couchInstance

var sslOptions = {
    keyFile: __dirname + '/../ssl/shredder_test.key',
    certFile: __dirname + '/../ssl/shredder_test.crt',
    pemFile: __dirname + '/../ssl/shredder_test.pem'
}

/**
 * Mock SSL certificate
 * @type {object}
 */
exports.sslOptions = sslOptions


/**
 * Start oose mock
 * @param {number} port
 * @param {string} host
 * @return {P}
 */
exports.start = function(config){
  return mockWorker.start(config).then(function(){
    couchInstance = mockCouch.createServer()
    couchInstance.listen(config.server.port)
    couchInstance.addDB(config.server.database,[])
    couchInstance.addDoc(config.server.database,{
      _id:'_design/workers',
      views:{
        "all": {
          "map": function(doc) { if(doc.type == 'worker') emit(doc.name, doc) }
        },
        "available": {
          "map": function(doc) { if(doc.type == 'worker' && doc.available) emit(doc.name, doc) }
        }
      }
    })
    couchInstance.addDoc(config.server.database,{
      _id:'shredder:worker:'+config.worker.name,
      active:true,
      available:true,
      host:config.worker.host,
      name:config.worker.name,
      port:config.worker.port,
      type:'worker',
      writable:true
    })
    return couchInstance
  })
}


/**
 * Stop oose prism
 * @return {P}
 */
exports.stop = function(){
   return new P(function(resolve,reject){
    couchInstance.close()
    mockWorker.stop()
    resolve(true)
  })
}
