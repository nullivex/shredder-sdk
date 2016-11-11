'use strict';
/*
var e2e = require('./helpers/e2e')
var mock = require('../mock')

var mockConfig = {
  master: {
    port: 5980,
    host: '127.0.0.1'
  }
}

describe('mock',function(){
  //spin up an entire cluster here
  this.timeout(3000)
  //start servers and create a user
  before(function(){
    return mock.start(mockConfig.master.port,mockConfig.master.host)
  })
  //remove user and stop services
  after(function(){
    return mock.stop()
  })

  it('mock should be up',e2e.checkUp('master',mockConfig))

  it('should not require authentication for public functions',
    e2e.checkPublic(mockConfig))

  it('should require a session for all protected functions',
    e2e.checkProtected(mockConfig))

  it('should login',function(){
    return e2e.masterLogin(mockConfig)()
      .then(function(session){
        e2e.user.session = session
      })
  })

  it('should create a job',e2e.jobCreate(mockConfig))

  it('should show job detail',e2e.jobDetail(mockConfig))

  it('should update a job',e2e.jobUpdate(mockConfig))

  it('should remove a job',e2e.jobRemove(mockConfig))

  it('should start a job',e2e.jobStart(mockConfig))

  it('should abort a job',e2e.jobAbort(mockConfig))

  it('should retry an aborted job',e2e.jobRetry(mockConfig))

})
*/