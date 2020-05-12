var querystring = require('querystring')
var https = require('https')
var fs = require('fs')


const RC_TOKEN_FILE = "rc_tokens.txt";
const RC_SERVER_URL = "platform.ringcentral.com";
const EV_SERVER_URL = "engage.ringcentral.com";
const EV_PATH = "/voice/api/v1/";

const LEGACY_SERVER_URL = "portal.vacd.biz";
const LEGACY_PATH = "/api/v1/";

function RestClient(clientId=null, clientSecret=null) {

  this.server = "";
  this.path = ""
  this.clientId = "";
  this.clientSecret = "";
  this.accessToken = null;
  this.accountId = null;
  this.accountInfo = null;

  if (clientId == null || clientSecret == null){
      this.server = LEGACY_SERVER_URL
      this.path = LEGACY_PATH
      this.mode = "Legacy"
  }else{
    this.server = EV_SERVER_URL
    this.path = EV_PATH
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.mode = "Engage"
  }
}
exports.RestClient = RestClient

RestClient.prototype = {
    getAccountId: function(){
      return this.accountId
    },
    setAccessToken: function (accessToken, callback){
        this.accessToken = accessToken;
        this.__readAccount(function(err, response){
            if (!err){
              return (callback == null) ? response : callback(null, response)
            }
        });
    },
    login: function(username, password, extension="", callback=null){
      if (this.mode == "Engage") {
        var thisClass = this
        this.__rc_login(username, password, extension, function(err, rcToken){
          if (!err){
              thisClass.__exchangeAccessTokens(rcToken, (err, response) => {
                if (!err){
                  return (callback == null) ? response : callback(null, response)
                }else {
                  return (callback == null) ? response : callback(response, null)
                }
              })
          }else{
            return (callback == null) ? err : callback(err, null)
          }
        })
      }else{
        if (this.accessToken != null){
            this.__readAccount();
        }else{
            this.__generateAuthToken(username, password, (err, resp) => {
              return (callback == null) ? resp : callback(err, resp);
            });
        }
      }
    },
    get: function(endpoint, params, callback) {
        if (this.accessToken == null)
          return callback("Login required!", null)
        var apiEndpoint = this.path + endpoint
        if (endpoint.indexOf('~') > 0){
          apiEndpoint = apiEndpoint.replace('~', this.getAccountId())
        }
        if (params != null && typeof(params) == "object")
            apiEndpoint += "?" + querystring.stringify(params)

        var headers = {
              'Accept': 'application/json',
              'Authorization': 'Bearer ' + this.accessToken
            }
        if (this.mode == "Legacy")
            headers = {
              'Accept': 'application/json',
              'X-Auth-Token': this.accessToken
            }
        var options = {host: this.server, path: apiEndpoint, method: 'GET', headers: headers};
        var thisClass = this
        var get_req = https.get(options, function(res) {
              var response = ""
              res.on('data', function (chunk) {
                  response += chunk
              }).on("end", function(){
                  if (res.statusCode == 200){
                      return callback(null, response)
                  }else if (res.statusCode == 401){
                      if (thisClass.mode == "Engage" && fs.existsSync(RC_TOKEN_FILE)){
                          thisClass.__checkSavedTokens((err, rcToken) => {
                            if (!err){
                              thisClass.__exchangeAccessTokens(rcToken, (err, token) => {
                                if (!err){
                                  thisClass.post(endpoint, params, callback)
                                }
                              })
                            }else{
                              return callback(err, rcToken)
                            }
                          })
                      }else{
                        return callback(res, null)
                      }
                  }else
                      return callback(res, null)
              });
          }).on('error', function(e) {
              return callback(e, null)
          });
    },
    post_old: function(endpoint, params, callback) {
      if (this.accessToken == null)
          return (callback == null) ? "Login required!" : callback("Login required!", null)
      var apiEndpoint = this.path + endpoint
      if (endpoint.indexOf('~') > 0){
        apiEndpoint = apiEndpoint.replace('~', this.getAccountId())
      }
      var body = ""
      if (params != null && typeof(params) == "object")
          body = JSON.stringify(params)

      var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
                }
      if (this.mode == "Legacy")
          headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Auth-Token': this.accessToken
          }
      var options = {host: this.server, path: apiEndpoint, method: 'POST', headers: headers};
      var thisClass = this
      var post_req = https.request(options, function(res) {
              var response = ""
              res.on('data', function (chunk) {
                    response += chunk
              }).on("end", function(){
                  if (res.statusCode == 200){
                      return (callback == null) ? response : callback(null, response)
                  }else if (res.statusCode == 401){
                      if (thisClass.mode == "Engage" && fs.existsSync(RC_TOKEN_FILE)){
                          thisClass.__checkSavedTokens((err, rcToken) => {
                            if (!err){
                              thisClass.__exchangeAccessTokens(rcToken, (err, token) => {
                                if (!err){
                                  thisClass.post(endpoint, params, callback)
                                }
                              })
                            }else{
                              return (callback == null) ? err : callback(err, rcToken)
                            }
                          })
                      }else{
                        return (callback == null) ? res : callback(res, null)
                      }
                  }else{
                      return (callback == null) ? res : callback(res, null)
                  }
                });
              }).on('error', function (e) {
                  return (callback == null) ? e : callback(e, null)
              })
      if (body != "")
          post_req.write(body);
      post_req.end();
    },
    post: function(endpoint, params, callback) {
      if (this.accessToken == null)
          return callback("Login required!", null)
      var apiEndpoint = this.path + endpoint
      if (endpoint.indexOf('~') > 0){
        apiEndpoint = apiEndpoint.replace('~', this.getAccountId())
      }
      var body = ""
      if (params != null && typeof(params) == "object")
          body = JSON.stringify(params)

      var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
                }
      if (this.mode == "Legacy")
          headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Auth-Token': this.accessToken
          }
      var options = {host: this.server, path: apiEndpoint, method: 'POST', headers: headers};

      var thisClass = this
      this.__send_request(options, body, (err, response) => {
        if (err){
          if (err.statusCode == 401){
            if (thisClass.mode == "Engage" && fs.existsSync(RC_TOKEN_FILE)){
                thisClass.__checkSavedTokens((err, rcToken) => {
                  if (!err){
                    thisClass.__exchangeAccessTokens(rcToken, (err, token) => {
                      if (!err){
                        thisClass.post(endpoint, params, callback)
                      }
                    })
                  }else{
                    return callback(err, rcToken)
                  }
                })
            }else{
              return callback(response, null)
            }
          }
        }else{
          return callback(null, response)
        }
      })
    },
    put: function(endpoint, params, callback) {
      if (this.accessToken == null)
          return callback("Login required!", null)
      var apiEndpoint = this.path + endpoint
      if (endpoint.indexOf('~') > 0){
        apiEndpoint = apiEndpoint.replace('~', this.getAccountId())
      }
      var body = ""
      if (params != null && typeof(params) == "object")
          body = JSON.stringify(params)

      var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
                }
      if (this.mode == "Legacy")
          headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Auth-Token': this.accessToken
          }
      var options = {host: this.server, path: apiEndpoint, method: 'PUT', headers: headers};
      var thisClass = this
      this.__send_request(options, body, (err, response) => {
        if (err){
          if (err.statusCode == 401){
            if (thisClass.mode == "Engage" && fs.existsSync(RC_TOKEN_FILE)){
                thisClass.__checkSavedTokens((err, rcToken) => {
                  if (!err){
                    thisClass.__exchangeAccessTokens(rcToken, (err, token) => {
                      if (!err){
                        thisClass.put(endpoint, params, callback)
                      }
                    })
                  }else{
                    return callback(err, rcToken)
                  }
                })
            }else{
              return callback(response, null)
            }
          }
        }else{
          return callback(null, response)
        }
      })
    },
    delete: function(endpoint, params, callback) {
      if (this.accessToken == null)
          return callback("Login required!", null)
      var apiEndpoint = this.path + endpoint
      if (endpoint.indexOf('~') > 0){
        apiEndpoint = apiEndpoint.replace('~', this.getAccountId())
      }
      var body = ""
      if (params != null && typeof(params) == "object")
          body = JSON.stringify(params)

      var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + this.accessToken
                }
      if (this.mode == "Legacy")
          headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Auth-Token': this.accessToken
          }
      var options = {host: this.server, path: apiEndpoint, method: 'DELETE', headers: headers};
      var thisClass = this
      this.__send_request(options, body, (err, response) => {
        if (err){
          if (err.statusCode == 401){
            if (thisClass.mode == "Engage" && fs.existsSync(RC_TOKEN_FILE)){
                thisClass.__checkSavedTokens((err, rcToken) => {
                  if (!err){
                    thisClass.__exchangeAccessTokens(rcToken, (err, token) => {
                      if (!err){
                        thisClass.delete(endpoint, params, callback)
                      }
                    })
                  }else{
                    return callback(err, rcToken)
                  }
                })
            }else{
              return callback(response, null)
            }
          }
        }else{
          return callback(null, response)
        }
      })
    },
    __send_request: function(options, body="", callback) {
      var thisClass = this
      var post_req = https.request(options, function(res) {
              var response = ""
              res.on('data', function (chunk) {
                    response += chunk
              }).on("end", function(){
                  if (res.statusCode == 200 || res.statusCode == 201){
                      callback(null, response)
                  }else if (res.statusCode == 401){
                      callback(res, null)
                  }
                });
              }).on('error', function (e) {
                  callback(e, null)
              })
      if (body != "")
          post_req.write(body);
      post_req.end();
    },
    __rc_login: function(username, password, extension, callback) {
        if (fs.existsSync(RC_TOKEN_FILE)) {
          this.__checkSavedTokens((err, rcToken) => {
              callback(err, rcToken)
          })
        }else{
          var endpoint = '/restapi/oauth/token'
          var url = RC_SERVER_URL
          var basic = this.clientId + ":" + this.clientSecret;
          var headers = {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'Accept': 'application/json',
              'Authorization': 'Basic ' + Buffer.from(basic).toString('base64')
              };
          var body = querystring.stringify({
                'grant_type' : 'password',
                'username' : encodeURIComponent(username),
                'password' : password,
                'extension' : extension
              });
          var options = {host: url, path: endpoint, method: 'POST', headers: headers};
          var post_req = https.request(options, function(res) {
              var response = ""
              res.on('data', function (chunk) {
                  response += chunk
              }).on("end", function(){
                  if (res.statusCode == 200){
                      var jsonObj = JSON.parse(response)
                      var timestamp = new Date().getTime()
                      var tokensObj = {
                        'tokens' : jsonObj,
                        'timestamp' : timestamp / 1000
                      }
                      fs.writeFile(RC_TOKEN_FILE, JSON.stringify(tokensObj), function(err) {
                        if(err)
                            console.log(err);
                      })
                      return callback(null, jsonObj.access_token)
                  }else{
                      return callback(response, null)
                  }
              });
          }).on('error', function (e) {
              return callback(e, null)
          });
          post_req.write(body);
          post_req.end();
        }
    },
    __generateAuthToken: function(username, password, callback) {
      var endpoint = LEGACY_PATH + "auth/login";
      body = `username=${username}&password=${password}`
      headers = { 'Content-Type': 'application/x-www-form-urlencoded' }

      var options = {host: this.server, path: endpoint, method: 'POST', headers: headers};
      var thisClass = this
      var post_req = https.request(options, function(res) {
              var response = ""
              res.on('data', function (chunk) {
                    response += chunk
              }).on("end", function(){
                  if (res.statusCode == 200){
                      var jsonObj = JSON.parse(response)
                      thisClass.accountId = jsonObj.accounts[0].accountId;
                      thisClass.__readPermanentsToken(jsonObj.authToken, (err, resp) =>{
                        callback(null, jsonObj)
                      })
                  }else
                      callback(response, null)
                })
              }).on('error', function (e) {
                  return callback(e, null)
              })
      if (body != "")
          post_req.write(body);
      post_req.end();
    },
    __readPermanentsToken: function(authToken, callback){
      var endpoint = LEGACY_PATH + "admin/token";
      headers = { 'X-Auth-Token': authToken }
      var options = {host: this.server, path: endpoint, method: 'GET', headers: headers};
      var thisClass = this
      var get_req = https.get(options, function(res) {
            var response = ""
            res.on('data', function (chunk) {
                response += chunk
            }).on("end", function(){
                if (res.statusCode == 200){
                  var jsonObj = JSON.parse(response)
                  if (jsonObj.length){
                    thisClass.accessToken = jsonObj[0]
                    callback(null, jsonObj)
                  }else{
                    thisClass.__generatePermanentToken(authToken, (err, resp) => {
                        callback(err, resp)
                    })
                  }
                }else{
                    callback(response, null)
                }
            });
        }).on('error', function(e) {
            callback(e, null)
        });
    },

    __generatePermanentToken: function(authToken, callback){
        endpoint = LEGACY_PATH + "admin/token";
        headers = { 'X-Auth-Token': authToken }
        var options = {host: this.server, path: endpoint, method: 'POST', headers: headers}
        var thisClass = this
        var post_req = https.request(options, function(res) {
                var response = ""
                res.on('data', function (chunk) {
                      response += chunk
                }).on("end", function(){
                    if (res.statusCode == 200){
                        var jsonObj = JSON.parse(response)
                        thisClass.accessToken = jsonObj
                        callback(null, jsonObj)
                    }else
                        callback(response, null)
                  });
                }).on('error', function (e) {
                    return callback(e, null)
                })
        post_req.end();
    },
    __readAccount: function(callback){
      var headers = {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + this.accessToken
          }
      if (this.mode == "Legacy")
          headers = {
            'Accept': 'application/json',
            'X-Auth-Token': this.accessToken
          }
      var path = this.path + "admin/accounts";
      var options = {host: this.server, path: path, method: 'GET', headers: headers};
      var thisClass = this
      var get_req = https.get(options, function(res) {
            var response = ""
            res.on('data', function (chunk) {
                response += chunk
            }).on("end", function(){
                if (res.statusCode == 200){
                    thisClass.accountInfo = JSON.parse(response)
                    thisClass.accountId = thisClass.accountInfo[0].accountId
                    callback(null, thisClass.accountInfo)
                }else{
                    callback(response, "")
                }
            });
        }).on('error', function(e) {
            callback(e, "")
        });
    },
    __checkSavedTokens: function(callback){
        var saved_tokens = fs.readFileSync(RC_TOKEN_FILE, 'utf8');
        var tokensObj = JSON.parse(saved_tokens)
        var date = new Date()
        var expire_time = (date.getTime() / 1000) - tokensObj.timestamp
        if (expire_time < tokensObj.tokens.expires_in){
            callback(null, tokensObj.tokens.access_token)
        }else{
            var body = ""
            if (expire_time < tokensObj.tokens.refresh_token_expires_in){
              body = querystring.stringify({
                  'grant_type' : 'refresh_token',
                  'refresh_token' : tokensObj.tokens.refresh_token
              });
              var endpoint = '/restapi/oauth/token'
              var url = RC_SERVER_URL
              var basic = this.clientId + ":" + this.clientSecret;
              var headers = {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'Accept': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(basic).toString('base64')
                  };
              var options = {host: url, path: endpoint, method: 'POST', headers: headers};
              var post_req = https.request(options, function(res) {
                  var response = ""
                  res.on('data', function (chunk) {
                      response += chunk
                  }).on("end", function(){
                      if (res.statusCode == 200){
                          var jsonObj = JSON.parse(response)
                          var timestamp = new Date().getTime()
                          var tokensObj = {
                            'tokens' : jsonObj,
                            'timestamp' : timestamp / 1000
                          }
                          fs.writeFile(RC_TOKEN_FILE, JSON.stringify(tokensObj), function(err) {
                            if(err)
                                console.log(err);
                          })
                          return callback(null, jsonObj.access_token)
                      }else{
                          return callback(response, null)
                      }
                  });
              }).on('error', function (e) {
                  return (callback == null) ? e : callback(e, null)
              });
              post_req.write(body);
              post_req.end();
            }else{
              return callback("Login required!", null)
            }
        }
    },
    __exchangeAccessTokens: function(rcToken, callback){
        var url = EV_SERVER_URL
        var endpoint = '/api/auth/login/rc/accesstoken'
        var content = {
            rcAccessToken: rcToken,
            rcTokenType: 'Bearer'
        };
        var body = querystring.stringify(content);
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
            }
        var options = {host: url, path: endpoint, method: 'POST', headers: headers};
        var thisClass = this
        var post_req = https.request(options, function(res) {
            var response = ""
            res.on('data', function (chunk) {
                response += chunk
            }).on("end", function(){
                if (res.statusCode == 200){
                    var tokensObj = JSON.parse(response)
                    thisClass.accessToken = tokensObj.accessToken;
                    thisClass.accountInfo = tokensObj.agentDetails;
                    thisClass.accountId = tokensObj.agentDetails[0].accountId;
                    callback(null, response)
                }else{
                    callback(response, null)
                }
            });
          }).on('error', function (e) {
              callback(e, null)
          })
        post_req.write(body);
        post_req.end();
    }
}
