//express모듈을 사용, cors는 parse 과정에서 오류 발생을 방지하기 위해 추가 
import express from "express";
import cors from "cors";

//es6방식으로 js를 작성할 때 절대경로를 사용하기 위해 아래 2줄 추가(없으면 sendFile()함수 경로에서 에러남)
import path from 'path';
import { fileURLToPath } from 'url';

// parsing 위해 사용하는 모듈
import bodyParser from "body-parser";

//mysql과 js 연동을 위한 모듈
import { createConnection } from "mysql";

//파일을 읽어오게 도와주는 fs(fileSystem 모듈)
import fs from 'fs'

//path와 url 모듈의 함수 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

//웹을 열면 DB에 모든 함수이름과 종목코드 저장 16~17
import { spawn as a } from 'child_process';

//디렉토리에 설치된 파이썬으로 실행
a('./python/python',['wholedata.py']);

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

  // mysql 접속 설정
  //fs.readFileSync로 json파일을 문자열로 읽어오고 JSON.parse로 Object로 변환해줌
  const conn = JSON.parse(fs.readFileSync('./sqlData/sqlData.json'))

  let connection = createConnection(conn); // DB 커넥션 생성

  connection.connect((err) => {
    if(err) console.log(err);
        console.log('Connected successfully');
    })
  
  //입력정보로 종목코드를 뽑아오는 sql 명령문 
  let sql= `SELECT 단축코드 FROM solodb.stock WHERE 한글명="${req.body.stock}"`
      
  connection.query(sql,function(err,stockcode){
      if (err) {
          console.log(err);
      }
      else{
          console.log(stockcode[0]["단축코드"])
          const result = a('./python/python',['inputstock.py',stockcode[0]["단축코드"]]);
      }
  });
  connection.end();
  })
