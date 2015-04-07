shredder-sdk [![Build Status](https://travis-ci.org/eSited/shredder-sdk.svg?branch=master)](https://travis-ci.org/eSited/shredder-sdk)
========

shredder Software Development Kit

## API Usage

```
$ npm install shredder-sdk --save
```

```js
'use strict';
var shredder = require('shredder-sdk')

shredder.api.updateConfig({
  master: {
    host: 'api.shredder.io',
    port: 5980
  }
})

//store the user session
var session = {}

//setup our api and login
var api = shredder.api.master()
api.postAsync({
  url: api.url('/user/login'),
  json: {
    username: 'myusername',
    password: 'mypassword'
  }
})
  .spread(api.validateResponse())
  .spread(function(res,body){
    console.log(body)
    session = body.session
  })
  .catch(api.handleNetworkError)
  .catch(shredder.NetworkError,function(err){
    console.log('A network error occurred: ' + err.message)
  })
```

## Mock Usage

```js
'use strict';
var shredder = require('shredder-sdk')

shredder.api.updateConfig({
  master: {
    port: 5980,
    host: '127.0.0.1'
  }
})

describe('my test',function(){
  before(function(){
    return shredder.mock.start(5980,'127.0.0.1')
  })
  after(function(){
    return shredder.mock.stop()
  })
  it('should be up',function(){
    var api = shredder.api.master()
    return api.postAsync(api.url('/ping'))
      .spread(function(res,body){
        expect(body.pong).to.equal('pong')
      })
  })
})
```

## Changelog

### 1.1.9
* Fix to get the keygen tool actually working.

### 1.1.8
* Fix to make sure keygen gets installed globally.

### 1.1.7
* Enable sticky session support.
* Add helper for generating session keys.
* Shredder login now takes username and password at call time `shredder.login(un,pw)`

### 1.1.6
* Drop session expiration they are now sticky

### 1.1.5
* Upgrade to latest oose-sdk
* Hard set token key name

### 1.1.4
* Fix error where jobContentUrl would give out an http:// URL instead of https

### 1.1.3
* Renamed `contentExists` to `jobContentExists`
* Renamed `contentUrl` to `jobContentUrl`

### 1.1.2
* Added contentExists functionality
* Added contentUrl helper

### 1.1.1
* Fix recursion bug on api config update

### 1.1.0
* Upgraded to match new OOSE standards
* Upgraded to `oose-sdk` 1.1.0
* Abstracted `MaxConcurrencyError`
* Added `Shredder` helper
* Added `job` mock
* Completed mock server
* Completed mock testing
* Added `Shredder` testing
* Added travis builds

### 1.0.1
* Use PEM for SSL rather than cert/key

### 1.0.0
* Initial Release
