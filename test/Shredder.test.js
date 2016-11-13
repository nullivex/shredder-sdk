'use strict';
var expect = require('chai').expect

//var mock = require('../mock')
var mockJob = require('../mock/helpers/job')
var Shredder = require('../helpers/Shredder')
var mockCouch = require('mock-couch');

//prevent bad cert errors during testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var mockConfig = {
  port: 5980,
  host: '127.0.0.1',
  database: 'shredder'
}

describe('Shredder',function(){
  var shredder = {}
  var couchInstance = {}
  var handle
  //spin up an entire cluster here
  this.timeout(3000)
  //start servers and create a user
  before(function(){
    couchInstance = mockCouch.createServer()
    couchInstance.listen(mockConfig.port)
    couchInstance.addDB(mockConfig.database,[])
    shredder = new Shredder(mockConfig)
    return shredder.connect(mockConfig.host,mockConfig.port).then(function(){
      return shredder.login()
    })
  })
  //remove user and stop services
  after(function(){
    couchInstance.close()
    return shredder.logout()
  })
  it('should reset the password',function(){
    return shredder.passwordReset()
      .then(function(result){
        expect(result.password).to.equal('Reset')
      })
  })
  it('should create a job',function(){
    return shredder.jobCreate(mockJob.description)
      .then(function(result){
        expect(result).to.have.property('handle')
        handle = result.handle
        expect(result.status).to.equal('staged')
      })
  })
  it('should get job details',function(){
    return shredder.jobDetail(handle)
      .then(function(result){
        expect(result.handle).to.equal(handle)
      })
  })
  it('should not update a job if not forced',function(){
    return shredder.jobUpdate(handle,{status: 'complete'})
      .then(function(result){
        expect(result.handle).to.equal(handle)
        expect(result.status).to.equal('staged')
      })
  })
  it('should update a job',function(){
    return shredder.jobUpdate(handle,{priority: 10},true)
      .then(function(result){
        expect(result.handle).to.equal(handle)
        expect(result.priority).to.equal(10)
      })
  })
  it('should start a job',function(){
    return shredder.jobStart(handle)
      .then(function(result){
        expect(result.handle).to.equal(handle)
        expect(result.status).to.equal('queued')
      })
  })
  it('should retry a job',function(){
    couchInstance.databases[mockConfig.database][handle].status = 'processing'
    return shredder.jobRetry(handle)
      .then(function(result){
        expect(result.handle).to.equal(handle)
        expect(result.status).to.equal('queued_retry')
      })
  })
  it('should abort a job',function(){
    couchInstance.databases[mockConfig.database][handle].status = 'processing'
    return shredder.jobAbort(handle)
      .then(function(result){
        expect(result.handle).to.equal(handle)
        expect(result.status).to.equal('queued_abort')
      })
  })
  it('should remove a job',function(){
    return shredder.jobRemove(handle)
      .then(function(result){
        expect(result.success).to.equal('Job removed')
        expect(result.count).to.equal(1)
      })
  })
  /*
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
  })*/
})
