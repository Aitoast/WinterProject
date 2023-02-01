import request from 'request';
import fs from 'fs';
import { setFlagsFromString } from 'v8';

/**
 * 내가만든 모히토 모듈
 */
class Mymojito{
  /**
   * key값 읽어오기, base_url 설정
  */
  constructor(api_key, api_secret){
    this.api_key = api_key;
    this.api_secret = api_secret;
    this.base_url = "https://openapi.koreainvestment.com:9443"
  }
  /**
  *토큰 발급함수
  */
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
  /**
   * 토큰이 있는지 확인하는 함수
   */
  check_access_token(){
    //읽어 보는데
    try{
      var result = fs.readFileSync('./token.dat','utf-8');
      //읽는데 성공이라면 유효일을 확인한다.
      var token_cut = new Date(JSON.parse(result).access_token_token_expired);
      var today = new Date();
      //유효기간이 남았다면 true
      if(token_cut.getTime() > today.getTime()){
        return true ;
      };
      //끝났다면 false
      return false;
    }
    //오류(없다)면 false 반환.
    catch(error){
      return false
    }
  }
}

