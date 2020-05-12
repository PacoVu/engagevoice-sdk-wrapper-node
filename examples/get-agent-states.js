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
      get_agent_states()
    }
})

function get_agent_states(){
    var endpoint = "admin/accounts/~/realTimeData/agent"
    ev.get(endpoint, null, function(err, response){
        if (err){
            console.log(err)
        }else {
            var jsonObj = JSON.parse(response)
            console.log(jsonObj)
        }
    })
}
