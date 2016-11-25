'use strict';
var oose = require('oose-sdk')
var program = require('commander')

var UserError = oose.UserError

var pkg = require('../package.json')

program
  .version(pkg.version)
  .option('-u, --username <s>','Username for login')
  .option('-p, --password <s>','Password for login')
  .option('-H, --host <s>','Couch host, defaults to localhost')
  .option('-P, --port <n>','Couch port, defaults to 5984')
  .parse(process.argv)


/**
 * Shredder Config
 * @type {{host: string, port: string}}
 */
var shredderConfig = {
  master: {
    host: program.host || 'localhost',
    port: program.port || 5984
  }
}

//setup our prism handle
var shredder = new (require('./Shredder'))(shredderConfig)

//connect
shredder.connect()
  .then(function(){
    return shredder.login(program.username,program.password)
  })
  .then(function(result){
    console.log('Login successful please use the token below')
    console.log(result)
  })
  .catch(UserError,function(err){
    console.log('ERROR: ' + err.message)
  })
