# Engage Voice SDK Wrapper for Node JS.

----
## Overview
Engage Voice SDK Wrapper for Node is a utility class, which helps you easily integrate your Node JS project with RingCentral Engage Voice Services.

----
## Add Engage Voice SDK Wrapper to a Node JS project
1. Download the EngageVoice SDK Wrapper for Node JS.
2. Unzip and copy the whole `engagevoice` folder to your project folder.

*OR*

1. To install the latest version directly from this github repo:
```
npm install git+https://github.com/pacovu/engagevoice-sdk-wrapper-node --save

npm install engagevoice-sdk-wrapper --save
```

----
## API References
**Constructor**
```
RestClient(clientId, clientSecret)
```

*Description:*
* Creates and initializes an EngageVoice SDK wrapper object.

*Parameters:*
* clientId: Set the `clientId` of a RingCentral app to enable login with RingCentral user credentials.
* clientSecret: Set the `clientSecret` of a RingCentral app to enable login with RingCentral user credentials.

*Example code:*
```
const EngageVoice = require('engagevoice-sdk-wrapper')

var ev = new EngageVoice.RestClient(RINGCENTRAL_CLIENT_ID, RINGCENTRAL_CLIENT_SECRET)
```
----
**Function login**
    login(username, password, extensionNumber)

*Description:*
* Login using a user's credential. If the mode was set "Engage", the username and password must be the valid username and password of a RingCentral Office user.

*Parameters:*
* username: username of a user in Legacy service or in RingCentral Office service.
* password: password of a user in Legacy service or in RingCentral Office service.
* extensionNumber: an extension number of a user. To be used if the `username` is a RingCentral company main number.

*Response:*


*Example code:*
```
# Login with RingCentral Office user credentials.

var ev = new EngageVoice.RestClient(RINGCENTRAL_CLIENT_ID, RINGCENTRAL_CLIENT_SECRET)
ev.login(RC_USERNAME, RC_PASSWORD, RC_EXTENSION, function(err, response){
    if (err)
      console.log(err)
    else{
      console.log(response)
    }
})

# Login with Legacy user credentials

var ev = new EngageVoice.RestClient()
ev.login(LEGACY_USERNAME, LEGACY_PASSWORD, "", function(err, response){
    if (err)
      console.log(err)
    else{
      console.log(response)
    }
})

```

**Function get**
```
get(endpoint, params, callback)
```
*Description:*
* Send an HTTP GET request to Engage Voice server.

*Parameters:*
* endpoint: Engage Voice API endpoint.
* params: a JSON object containing key/value pair parameters to be sent to an Engage Voice API, where the keys are the query parameters of the API.
* callback: if specified, response is returned to callback function.

*Response:*
API response in JSON object

*Example code:*
```
# Read account info.

var endpoint = "admin/accounts"
ev.get(endpoint, null, function(err, response){
    if (err){
        console.log(err)
    }else {
        var jsonObj = JSON.parse(response)
        console.log(jsonObj)
        console.log("===========")
    }
})
```

**Function post**
```
post(endpoint, params, callback)
```
*Description:*
* Sends an HTTP POST request to Engage Voice server.

*Parameters:*
* endpoint: Engage Voice API
* params: a JSON object containing key/value pair parameters to be sent to an Engage Voice API, where the keys are the body parameters of the API.
* callback: if specified, response is returned to callback function.

*Response:*
API response in JSON object

*Example code:*

```
# Search for campaign leads.

var endpoint = "admin/accounts/~/campaignLeads/leadSearch"
var params = { 'firstName': "Larry" }
ev.post(endpoint, params, function(err, response){
    if (err){
        console.log(err)
    }else {
        var jsonObj = JSON.parse(response)
        console.log(jsonObj)
        console.log("===========")
    }
})
```
## License
Licensed under the MIT License.
