// import broker from './Mymojito/Mymojito.js'

// broker.fetch_price('001500').then((body)=>{
//   console.log(body);
// })

// var ana = function(prams){
//   console.log(`${1}`);
// }

// ana()

import axios from 'axios'
import fs from 'fs'

var app = fs.readFileSync('./app.txt','utf8')
var secret = fs.readFileSync('./secret.txt','utf8')

var option = {
  method: 'POST',
  url: `https://openapi.koreainvestment.com:9443/oauth2/tokenP`,
  data : JSON.stringify({ 
    "grant_type": "client_credentials", 
    "appkey" : app, 
    "appsecret": secret, 
  })
}

axios(option)
.then(function (response) {
  console.log(response.body);
})
.catch(function (error) {
  console.log(error);
});