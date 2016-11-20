'use strict';
var expect = require('chai').expect
var mock = require('../mock')
var Shredder = require('../helpers/Shredder')

var shredderConfig = {
  port: 5980,
  host: '127.0.0.1'
}

var mockConfig = {
  server :{
    port: 5980,
    host: '127.0.0.1',
    database: 'shredder'
  },
   worker:{
    port: 5981,
    host: '127.0.0.1',
    database: 'shredder',
    name:'fake'
  }
}

describe('mock',function(){
  var shredder
  //spin up an entire cluster here
  this.timeout(3000)
  //start servers and create a user
  before(function(){
    shredder = new Shredder(shredderConfig)
    return mock.start(mockConfig).then(function(){
      return shredder.connect(shredderConfig.host,shredderConfig.port)
    })
  })
  //remove user and stop services
  after(function(){
    return mock.stop()
  })

  it('should start up',function(){
    return shredder.login()
      .then(function(result){
        expect(result).to.be.true;
      })
  })

})
