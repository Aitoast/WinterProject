import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import { createConnection } from "mysql";
import broker from './Mymojito/Mymojito.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = express();


//서버 3000번 사용 
server.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});

server.use(cors())
server.use(bodyParser.urlencoded({extended : true}));

//초기 화면 불러오기
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/start.html");
});



// post로 검색창의 입력값 받아오기
server.post("/",(req,res)=>{
  //입력값 확인용 코드 추후 삭제하고 sendFile 함수 사용 예정
  res.send(`<span>${req.body.stock}</span>`)

  const conn =JSON.parse(fs.readFileSync('SoloData.json'))
  let connection = createConnection(conn); // DB 커넥션 생성

  connection.connect((err) => {
    if(err) console.log(err);
        console.log('Connected successfully');
    })
  
  //입력정보로 종목코드를 뽑아오는 sql 명령문 
  let sql= `SELECT 단축코드 FROM solodb.stock WHERE 한글명="${req.body.stock}";`;
  connection.query(sql,function(err,stockcode){
      if (err) {
          console.log(err);
      }
      else{
          console.log(stockcode[0]["단축코드"])
          broker.fetch_price(stockcode[0]["단축코드"]).then(function(stocka){
            console.log(stocka)
            //뽑아온 정보를 1행 테이블로 sql에 저장
            let savein=`INSERT INTO stockinfo SET ?`
            connection.query(savein,stocka,function(err,results){
              if(err) {
                console.log(err);
                connection.end();
              }
              else {
                console.log("save succesfully")
                connection.end();
              }
            })
          })  
      }
  });

  })




  