const EngageVoice = require('engagevoice-sdk-wrapper')

RC_CLIENT_ID=""
RC_CLIENT_SECRET=""

RC_USERNAME=""
RC_PASSWORD=""
RC_EXTENSION=""

LEGACY_USERNAME= "";
LEGACY_PASSWORD= "";

const MODE = "ENGAGE";

if (MODE == "ENGAGE"){
  var ev = new EngageVoice.RestClient(RC_CLIENT_ID, RC_CLIENT_SECRET)
  var username= RC_USERNAME
  var password = RC_PASSWORD
  var extensionNum = RC_EXTENSION
}else{
  var ev = new EngageVoice.RestClient()
  var username= LEGACY_USERNAME
  var password = LEGACY_PASSWORD
  var extensionNum = ""
}

ev.login(username, password, extensionNum, function(err, response){
    if (err)
      console.log(err)
    else{
      list_account_agent_groups()
    }
})

function list_account_agent_groups(){
    var endpoint = 'admin/accounts/~/agentGroups'
    ev.get(endpoint, null, function(err, response){
        if (err){
            console.log(err)
        }else {
            var jsonObj = JSON.parse(response)
            console.log(jsonObj)
        }
    })
}
