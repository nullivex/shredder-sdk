'use strict';
var mockCouch = require('mock-couch');
var P = require('bluebird')
var couchInstance


/**
 * Start oose mock
 * @param {number} port
 * @param {string} host
 * @return {P}
 */
exports.start = function(config){
  return new P(function(resolve,reject){
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

    resolve(couchInstance)
  })
}


/**
 * Stop oose prism
 * @return {P}
 */
exports.stop = function(){
   return new P(function(resolve,reject){
    couchInstance.close()
    resolve(true)
  })
}
