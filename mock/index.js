'use strict';
var P = require('bluebird')
var bodyParser = require('body-parser')
var express = require('express')
var fs = require('graceful-fs')
var https = require('https')
var oose = require('oose-sdk')

var app = express()
var pkg = require('../package.json')
var sslOptions = {
  keyFile: __dirname + '/../ssl/shredder_test.key',
  certFile: __dirname + '/../ssl/shredder_test.crt',
  key: fs.readFileSync(__dirname + '/../ssl/shredder_test.key'),
  cert: fs.readFileSync(__dirname + '/../ssl/shredder_test.crt')
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
  res.json({message: 'Welcome to OOSE Mock version ' + pkg.version})
})

//health test
app.post('/ping',function(req,res){
  res.json({pong: 'pong'})
})

//--------------------
//protected routes
//--------------------
var validateSession = function(req,res,next){
  var token = req.get('X-OOSE-Token')
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
app.post('/user/session/validate',validateSession,function(req,res){
  res.json({success: 'Session Valid'})
})
app.post('/user/session/update',validateSession,function(req,res){
  if(req.body.data)
    user.session.data = JSON.stringify(req.body.data)
  res.json(user.session)
})


/**
 * Mock SSL certificate
 * @type {object}
 */
exports.sslOptions = sslOptions


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
