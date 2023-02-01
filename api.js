import request from 'request';
import fs from 'fs';

class Mymojito{
  //key값 읽어오기, base_url 설정
  constructor(app, secret){
    this.app = app;
    this.secret = secret;
    this.base_url = "https://openapi.koreainvestment.com:9443"
  }
}