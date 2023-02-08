import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { createConnection } from "mysql";
import broker from "./Mymojito/Mymojito.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = express();

//서버 3000번 사용
server.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});

server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));

//초기 화면 불러오기
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/HTML/start.html");
});

// post로 검색창의 입력값 받아오기
server.post("/", (req, res) => {
  //입력값 확인용 코드 추후 삭제하고 sendFile 함수 사용 예정
  res.send(`<span>${req.body.stock}</span>`);

  const conn = JSON.parse(fs.readFileSync("SoloData/SoloData.json"));
  let connection = createConnection(conn); // DB 커넥션 생성

  connection.connect((err) => {
    if (err) console.log(err);
    else console.log("Connected successfully");
  });

  //입력정보로 종목코드를 뽑아오는 sql 명령문
  let sql = `SELECT 단축코드 FROM solodb.stock WHERE 한글명="${req.body.stock}";`;
  connection.query(sql, function (err, stockcode) {
    if (err) console.log(err);
    else {
      console.log(stockcode[0]["단축코드"]);
      broker.fetch_price(stockcode[0]["단축코드"]).then(function (stocka) {
        // 뽑아온 정보를 열이1개인 테이블로 sql에 저장
        let del = `DELETE FROM solodb.stockinfo; `; // 원래 테이블을 초기화 시키는 명령문
        connection.query(del, function (err, results) {
          if (err) console.log(err);
          else console.log("delete succesfully");
        });

        // 주식 정보를 table에 넣는 명령문
        let savein = `INSERT INTO solodb.stockinfo SET ?; `; 
        connection.query(savein, stocka, function (err, results) {
          if (err) console.log(err); 
          else console.log("save succesfully");
        });
      });
      
      broker
        .fetch_today_1m_ohlcv(stockcode[0]["단축코드"], "")
        .then(function (mindata) {
          // 데이터는 2차원배열로 받아 b에 넣는다.
          var b = mindata;

          //원래 테이블을 초기화 해주는 명령문
          var del2 = `DELETE FROM solodb.chartdata;`; 
          connection.query(del2, function (err, results) {
            if (err) console.log(err);
            else console.log("delete succesfully");
          });

          /**
           * 주식 일 분봉을 시간까지 정해서 db에 데이터 저장  
           * 쿼리문에서 데이터 갯수가 맞다면 컬럼이름없이 insert문을 사용할수있음
           * 쿼리문 ? 포맷팅 내용은 이원찬 노션 공유 페이지에 정리 해놨음
           * 2차원배열인 b를 왜 3차원 배열로 query메소드에 넣는지도 노션에 정리해놨음
           */
          var cha = `INSERT INTO solodb.chartdata values ?;`;
          connection.query(cha, [b], function (err, results) {
            if (err) console.log(err);
            else console.log("save succesfully");            
            connection.end();
          });
        });
    }
  });
});
