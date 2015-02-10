'use strict';
var P = require('bluebird')
var bodyParser = require('body-parser')
var express = require('express')
var fs = require('graceful-fs')
var https = require('https')
var oose = require('oose-sdk')

var app = express()
var job = require('./helpers/job')
var pkg = require('../package.json')
var sslOptions = {
  keyFile: __dirname + '/../ssl/shredder_test.key',
  certFile: __dirname + '/../ssl/shredder_test.crt',
  pemFile: __dirname + '/../ssl/shredder_test.pem',
  key: fs.readFileSync(__dirname + '/../ssl/shredder_test.key'),
  cert: fs.readFileSync(__dirname + '/../ssl/shredder_test.crt'),
  pem: fs.readFileSync(__dirname + '/../ssl/shredder_test.pem')
}
var server = https.createServer(
  {
    key: sslOptions.key,
    cert: sslOptions.cert
  },
  app
)
var user = require('./helpers/user')
var UserError = oose.UserError

//make some promises
P.promisifyAll(fs)
P.promisifyAll(server)

//setup
app.use(bodyParser.json())


//--------------------
//public routes
//--------------------

//home page
app.post('/',function(req,res){
  res.json({message: 'Welcome to Shredder Mock version ' + pkg.version})
})

//health test
app.post('/ping',function(req,res){
  res.json({pong: 'pong'})
})

//--------------------
//protected routes
//--------------------
var validateSession = function(req,res,next){
  var token = req.get('X-Shredder-Token')
  if(!token || user.session.token !== token){
    res.status(401)
    res.json({error: 'Invalid session'})
  } else {
    req.session = user.session
    next()
  }
}

//user functions
app.post('/user/login',function(req,res){
  P.try(function(){
    if(!req.body.username || 'test' !== req.body.username)
      throw new UserError('No user found')
    if(!req.body.password || user.password !== req.body.password)
      throw new UserError('Invalid password')
    res.json({
      success: 'User logged in',
      session: user.session
    })
  })
    .catch(UserError,function(err){
      res.json({error: err.message})
    })
})

app.post('/user/logout',validateSession,function(req,res){
  res.json({success: 'User logged out'})
})
app.post('/user/password/reset',validateSession,function(req,res){
  res.json({
    success: 'User password reset',
    password: user.password
  })
})
app.post('/user/session/renew',validateSession,function(req,res){
  var session = user.session
  session.expires = new Date(req.body.expires)
  res.json({
    session: session
  })
})

//job functions
app.post('/job/create',validateSession,function(req,res){
  var data = req.body
  res.json({
    handle: job.handle,
    description: data.description,
    priority: data.priority,
    category: data.category || 'resource',
    UserId: job.UserId
  })
})
app.post('/job/detail',validateSession,function(req,res){
  res.json({
    handle: job.handle,
    description: job.description,
    priority: job.priority,
    category: job.category,
    status: job.status,
    statusDescription: job.statusDescription,
    stepTotal: job.stepTotal,
    stepComplete: job.stepComplete,
    frameTotal: job.frameTotal,
    frameComplete: job.frameComplete,
    frameDescription: job.frameDescription,
    UserId: job.UserId
  })
})
app.post('/job/update',validateSession,function(req,res){
  var data = req.body
  res.json({
    handle: data.handle || job.handle,
    description: data.description || job.description,
    priority: data.priority || job.priority,
    category: data.category || job.category,
    status: data.status || job.status,
    statusDescription: data.statusDescription || job.statusDescription,
    stepTotal: data.stepTotal || job.stepTotal,
    stepComplete: data.stepComplete || job.stepComplete,
    frameTotal: data.frameTotal || job.frameTotal,
    frameComplete: data.frameComplete || job.frameComplete,
    frameDescription: data.frameDescription || job.frameDescription,
    UserId: data.UserId || job.UserId
  })
})
app.post('/job/remove',validateSession,function(req,res){
  res.json({
    success: 'Job removed',
    count: 1
  })
})
app.post('/job/start',validateSession,function(req,res){
  var jobStart = job
  jobStart.status = 'queued'
  res.json(jobStart)
})
app.post('/job/retry',validateSession,function(req,res){
  var jobRetry = job
  jobRetry.status = 'queued_retry'
  res.json(jobRetry)
})
app.post('/job/abort',validateSession,function(req,res){
  var jobAbort = job
  jobAbort.status = 'queued_abort'
  res.json(jobAbort)
})
app.post('/job/content/exists',validateSession,function(req,res){
  res.json({
    exists: false
  })
})
app.get('/job/content/download/:handle/:file',function(req,res){
  res.type('text/plain')
  res.send('foo\n')
})


/**
 * Mock SSL certificate
 * @type {object}
 */
exports.sslOptions = sslOptions


/**
 * Mock job
 * @type {object}
 */
exports.job = job


/**
 * Mock user and session
 * @type {object}
 */
exports.user = user


/**
 * Start oose mock
 * @param {number} port
 * @param {string} host
 * @return {P}
 */
exports.start = function(port,host){
  return server.listenAsync(+port,host)
}


/**
 * Stop oose prism
 * @return {P}
 */
exports.stop = function(){
  return server.closeAsync()
}
