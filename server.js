import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { createConnection } from "mysql";
import broker from "./Mymojito/Mymojito.js";
import fs from "fs";

const stock_1m_columns = [
  "stck_bsop_date",
  "stck_cntg_hour",
  "stck_prpr",
  "stck_oprc",
  "stck_hgpr",
  "stck_lwpr",
  "cntg_vol",
  "acml_tr_pbmn",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = express();

//서버 3000번 사용
server.listen(3000, (err) => {
  if (err) return console.log(err);
  console.log("The server is listening on port 3000");
});

server.use(bodyParser.urlencoded({ extended: true }));

//초기 화면 불러오기
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/HTML/start.html");
});

// post로 검색창의 입력값 받아오기
server.post("/", (req, res) => {
  /** 종목 한글명 */
  const stock_kr_string = req.body.stock;
  //입력값 확인용 코드 추후 삭제하고 sendFile 함수 사용 예정
  res.send(`<span>${stock_kr_string}</span>`);

  const conn = JSON.parse(fs.readFileSync("SoloData/SoloData.json"));
  let connection = createConnection(conn); // DB 커넥션 생성

  connection.connect((err) => {
    if (err) console.log(err);
    else console.log("Connected successfully");
  });

  /**입력정보로 종목코드를 뽑아오는 sql 명령문*/
  let select_sql = `SELECT 단축코드 FROM stock WHERE 한글명="${stock_kr_string}";`;
  connection.query(select_sql, function (err, respone) {
    //종목목록에 없는 종목을 사용자가 입력했을때
    if (err) console.log(err);
    else {
      /** 종목코드 */
      const stock_code = respone[0]["단축코드"];
      console.log(stock_code);
      broker.fetch_price(stock_code).then(
        /** @param {Object} stock_info fetch_price로 가져온 Object형 변수*/
        function (stock_info) {
          // 여러 사용자가 데이터를 입력할 때 한 테이블에 쓰면 충돌이 발생할 것이기 때문에
          // 주식마다 주식정보, 분봉 테이블을 생성시킨다. 존재할 시 데이터 바로 입력
          let create_sql = `CREATE TABLE ${stock_kr_string}info ( 
          ${Object.keys(stock_info).join(` VARCHAR(50),
          `)} VARCHAR(50)
          );`;
          connection.query(create_sql, function (err, results) {
            //만약 create문이 에러라면 테이블을 초기화(삭제)한다.
            if (err) {
              // 원래 테이블을 초기화 시키는 명령문
              let del_sql = `DELETE FROM ${stock_kr_string}info; `;
              connection.query(del_sql, function (err, results) {
                if (err) console.log(err);
                else console.log("delete succesfully");
              });
            } else console.log("create table succesfully");
            //테이블 생성,초기화 이후 데이터 저장
            let insert_sql = `INSERT INTO ${stock_kr_string}info SET ?;`;
            connection.query(insert_sql, stock_info, function (err, results) {
              if (err) console.log(err);
              else console.log("save succesfully");
            });
          });
        }
      );

      broker.fetch_today_1m_ohlcv(stock_code, "").then(
        /** @param {Array<Array<string>>} mindata 분봉데이터 2차원배열*/
        function (mindata) {
          let create_sql = `CREATE TABLE ${stock_kr_string}분봉 ( 
            ${stock_1m_columns.join(` VARCHAR(50),
            `)} VARCHAR(50)
            );`;
          connection.query(create_sql, function (err, results) {
            //create문이 에러라면 테이블 초기화
            if (err) {
              // 원래 테이블을 초기화 시키는 명령문
              let del_sql = `DELETE FROM ${stock_kr_string}분봉; `;
              connection.query(del_sql, function (err, results) {
                if (err) console.log(err);
                else console.log("delete succesfully");
              });
            } else console.log("create table succesfully");
            //테이블 생성,초기화 이후 데이터 저장
            var insert_sql = `INSERT INTO ${stock_kr_string}분봉 values ?;`;
            //주식 일 분봉을 시간까지 정해서 db에 데이터 저장
            connection.query(insert_sql, [mindata], function (err, results) {
              if (err) console.log(err);
              else console.log("save succesfully");
              connection.end();
            });
          });
        }
      );
    }
  });
});
