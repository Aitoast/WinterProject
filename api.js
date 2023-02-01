import request from 'request';
import fs from 'fs';

class Mymojito{
  //key값 읽어오기, base_url 설정
  constructor(api_key, api_secret){
    this.api_key = api_key;
    this.api_secret = api_secret;
    this.base_url = "https://openapi.koreainvestment.com:9443"
  }
  issue_token(){
    var option = {
      method: 'POST',
      url: `${this.base_url}/oauth2/tokenP`,
      form : JSON.stringify({ 
        "grant_type": "client_credentials", 
        "appkey" : this.api_key, 
        "appsecret": this.api_secret, 
      })
    }
    request(option, function (error, response) {
      if (error) throw new Error(error);

      var token_data = JSON.parse(response.body);

      this.access_token = `Bearer ${token_data.access_token}`

      token_data.api_key = this.api_key

      token_data.api_secret = this.api_secret

      fs.writeFile('token.dat',JSON.stringify(token_data),function(err){
        if(err) throw err;
      })
    });
  }

}

