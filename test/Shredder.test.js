'use strict';
var expect = require('chai').expect

var mock = require('../mock')
var Shredder = require('../helpers/Shredder')

//prevent bad cert errors during testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var mockConfig = {
  master: {
    port: 5980,
    host: '127.0.0.1'
  }
}

describe('Shredder',function(){
  var shredder = {}
  //spin up an entire cluster here
  this.timeout(3000)
  //start servers and create a user
  before(function(){
    shredder = new Shredder({
      username: mock.user.username,
      password: mock.user.password
    })
    return mock.start(mockConfig.master.port,mockConfig.master.host)
      .then(function(){
        return shredder.connect(mockConfig.master.host,mockConfig.master.port)
      })
      .then(function(){
        return shredder.login()
      })
  })
  //remove user and stop services
  after(function(){
    return shredder.logout()
      .then(function(){
        return mock.stop()
      })
  })
  it('should prepare a request object',function(){
    return shredder.prepare()
      .then(function(client){
        expect(client.options.host).to.equal(mockConfig.master.host)
        expect(client.options.port).to.equal(mockConfig.master.port)
      })
  })
  it('should reset the password',function(){
    return shredder.passwordReset()
      .then(function(result){
        expect(result.password).to.equal(mock.user.password)
      })
  })
  it('should create a job',function(){
    return shredder.jobCreate(mock.job.description)
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
      })
  })
  it('should get job details',function(){
    return shredder.jobDetail(mock.job.handle)
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
      })
  })
  it('should update a job',function(){
    return shredder.jobUpdate(mock.job.handle,{status: 'complete'})
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
        expect(result.status).to.equal('complete')
      })
  })
  it('should remove a job',function(){
    return shredder.jobRemove(mock.job.handle)
      .then(function(result){
        expect(result.success).to.equal('Job removed')
        expect(result.count).to.equal(1)
      })
  })
  it('should start a job',function(){
    return shredder.jobStart(mock.job.handle)
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
        expect(result.status).to.equal('queued')
      })
  })
  it('should retry a job',function(){
    return shredder.jobRetry(mock.job.handle)
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
        expect(result.status).to.equal('queued_retry')
      })
  })
  it('should abort a job',function(){
    return shredder.jobAbort(mock.job.handle)
      .then(function(result){
        expect(result.handle).to.equal(mock.job.handle)
        expect(result.status).to.equal('queued_abort')
      })
  })
  it('should check if content exists',function(){
    return shredder.jobContentExists(mock.job.handle,'video.mp4')
      .then(function(result){
        expect(result).to.equal(false)
      })
  })
  it('should generate a content download url',function(){
    var url = shredder.jobContentUrl(mock.job.handle,'video.mp4')
    expect(url).to.equal(
      'https://127.0.0.1:5980/job/content/download/' +
      mock.job.handle + '/video.mp4'
    )
  })
  it('should connect with a session key',function(){
    var shredder = new Shredder().setSession(mock.user.session.token)
    return shredder.connect(mockConfig.master.host,mockConfig.master.port)
      .then(function(){
        return shredder.jobContentExists(mock.job.handle,'video.mp4')
      })
      .then(function(result){
        expect(result).to.equal(false)
      })
  })
})
