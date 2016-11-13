'use strict';
var expect = require('chai').expect
var mock = require('../mock')
var Shredder = require('../helpers/Shredder')
var mockConfig = {
  port: 5980,
  host: '127.0.0.1'
}

describe('mock',function(){
  var shredder
  //spin up an entire cluster here
  this.timeout(3000)
  //start servers and create a user
  before(function(){
    shredder = new Shredder(mockConfig)
    return mock.start(mockConfig.port,mockConfig.host).then(function(){
      return shredder.connect(mockConfig.host,mockConfig.port)
    })
  })
  //remove user and stop services
  after(function(){
    return mock.stop()
  })

  it('should reset the password',function(){
    return shredder.login()
      .then(function(result){
        expect(result).to.be.true;
      })
  })

})
