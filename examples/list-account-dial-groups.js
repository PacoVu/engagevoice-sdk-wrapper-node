const EngageVoice = require('engagevoice-sdk-wrapper')

RC_CLIENT_ID=""
RC_CLIENT_SECRET=""

RC_USERNAME=""
RC_PASSWORD=""
RC_EXTENSION=""

var ev = new EngageVoice.RestClient(RC_CLIENT_ID, RC_CLIENT_SECRET)

ev.login(RC_USERNAME, RC_PASSWORD, RC_EXTENSION, function(err, response){
    if (err)
      console.log(err)
    else{
      get_account_dial_groups()
    }
})

function get_account_dial_groups(){
    var endpoint = "admin/accounts/~/dialGroups"
    ev.get(endpoint, null, function(err, response){
        if (err){
            console.log(err)
        }else {
            var jsonObj = JSON.parse(response)
            console.log(jsonObj)
        }
    })
}
