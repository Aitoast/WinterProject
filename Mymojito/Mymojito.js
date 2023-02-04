import request from 'request';
import fs from 'fs';

/**
 * 내가만든 모히토 모듈
 */
class Mymojito{
  /**
   * 속성값들 초기화
   * @param {string} api_key app키 나중 환경변수 변경예정
   * @param {string} api_secret secret키 나중 환경변수 변경예정
   */
  constructor(api_key, api_secret){
    this.api_key = api_key;
    this.api_secret = api_secret;
    this.base_url = "https://openapi.koreainvestment.com:9443"
    this.access_token = "";
    if(this.check_access_token()){
      this.load_access_token();
    }
    else{
      this.issue_token();
    }
  }
  /**
  *토큰을 발급하여 access_token속성 갱신, token.dat파일 생성
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
        console.log(`토큰 갱신`);
      })
    });
  }
  /**
   * 토큰이 없거나 유효기간이 유효한지 확인
   * @returns {boolean} true | false
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
  /**
   * 토큰파일 데이터를 속성으로 불러오기
   */
  load_access_token(){
    var data = fs.readFileSync('./token.dat','utf-8')
    this.access_token = `Bearer ${JSON.parse(data).access_token}`
    console.log(`토큰읽어옴`);
  }
  /**
   * 종목코드의 현재가 프로미스객체를 반환
   * @param {string} symbol 종목코드
   */
  fetch_price(symbol) {
    var path = "uapi/domestic-stock/v1/quotations/inquire-price";
    var option = {
      method: 'GET',
      url: `${this.base_url}/${path}`,
      headers : { 
        "content-type": "application/json",
        "authorization": this.access_token,
        "appkey" : this.api_key, 
        "appsecret": this.api_secret,
        "tr_id": "FHKST01010100"
      },
      qs : {
        fid_cond_mrkt_div_code: "J",
        fid_input_iscd : symbol
      }
    }
    return new Promise(function(resolve,reject){
      request(option, function (error, response, body) {
        if (error) throw new Error(error);
        resolve(JSON.parse(body))
      })
    })
  }
  /**
   * - (private) to부터 30분간 일분봉 조회 메소드 프로미스 반환
   * - output2에는 30,29,28~,1분까지 데이터가 차례로 담겨있음
   * @param {string} symbol : 종목코드
   * @param {string} to : to부터 일분봉조회 ex)123000 => 12시30분~12시까지 조회
   * @returns Promise객체 반환 then으로 동기화!
   */
  #fetch_today_1m_ohlcv(symbol, to){
    var path = "/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice"
    var option = {
      method: 'GET',
      url: `${this.base_url}/${path}`,
      headers : {
          "content-type": "application/json; charset=utf-8",
          "authorization": this.access_token,
          "appKey": this.api_key,
          "appSecret": this.api_secret,
          "tr_id": "FHKST03010200",
          "tr_cont": "",
      },
      qs : {
          "fid_etc_cls_code": "",
          "fid_cond_mrkt_div_code": "J",
          "fid_input_iscd": symbol,
          "fid_input_hour_1": to,
          "fid_pw_data_incu_yn": "N"
      }
    }
    return new Promise(function(resolve,reject){
      request(option, function (error, response, body) {
        if (error) throw new Error(error);
        resolve(JSON.parse(body))
      })
    })
  }
}


var app = fs.readFileSync('./app.txt','utf8')
var secret = fs.readFileSync('./secret.txt','utf8')

var broker = new Mymojito(app,secret)

// 토큰을 반복적으로 갱신하는 코드
setInterval(() => {
  broker.issue_token()
}, 1000);

export default broker
