import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { createConnection } from "mysql";
import broker from "./Mymojito/Mymojito.js";
import fs from "fs";
import {} from "./symbol_fetch/symbol_fetch.js"

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
const port = 3000
//서버 3000번 사용
server.listen(port, (err) => {
  if (err) return console.log(err);
  console.log(`The server is listening on port ${port}`);
});

server.use(bodyParser.urlencoded({ extended: true }));


//html 템플릿 생성
var html = {
  /**
   * 홈페이지는 css를 배열로 받은뒤 html 문자열을 반환함*/
  hompage : function(css_list = []){
    var css = '';
    css_list.map((css_element)=>{
      css += `<style>${css_element}</style>`
    })
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
  ${css}
      <title>Winter-Project</title>
      <meta charset="UTF-8">
      <script src="https://code.highcharts.com/highcharts.js"></script>
  </head>
  <body>
      <!-- 제목과 검색창이있는 top태그 -->
      <nav class="top">
          <!-- 제목이 적혀있는 h1태그 -->
          <h1 class="title__box__name">Stock File<br>Stockholm
              <line class="title__line"></line>
          </h1>
          <!-- 검색창이 있는 form태그 -->
          <form class="title__search" method="post">
              <input type="text" placeholder="enter the stock name">
          </form>
      </nav>
    </body>
    </html>`},
  /**
   * 
   * @param {Array} css_list css파일을 읽은 문자열 리스트
   * @param {Array} script_list script파일을 읽은 문자열 리스트
   * @param {Array} stock_data [종목이름,종목현재가] 리스트
   * @param {Array} stock_1m_data 분봉데이터가 들어있는 리스트
   * @param {Array} stock_info_data 4가지 정보가 들어있는 리스트
   * @returns 
   */
  serch_page : function(css_list = [],
    script_list = [],
    stock_data = [],
    stock_1m_data = [],
    stock_info_data = []
    ){
    var css = '';
    css_list.map((css_element)=>{
      css += `<style>${css_element}</style>${'\n'}`;
    })
    var script = '';
    script_list.map((script_element)=>{
      script += `<script>${script_element}</script>${'\n'}`;
    })
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Winter-Project</title>
        <meta charset="UTF-8">
        <script src="https://code.highcharts.com/highcharts.js"></script>
        ${css}
    </head>
    <body>
        <nav class="top">
            <h1 class="title__box__name">Stock File<br>Stockholm
                <line class="title__line"></line>
            </h1>
            <form class="title__search" action="post">
                <input type="text" placeholder="enter the stock name">
            </form>
        </nav>
        <underbox class="underbox">
            <div class="underbox__main__index">
                <div class="underbox_stock-name">${stock_data[0]}</div>
                <div class="underbox_stock">
                    <span class="underbox_stock_price">${stock_data[1]}</span>
                </div>
            </div>
            <div class="underbox__main__graph" id="container">
            </div>
            <div class="underbox_main_info">
                <div class="underbox_stock_info" id="first_info">
                    <p class="stock_info_keys">전일대비 퍼센트</p>
                    <p class="stock_info_values">${stock_info_data[0]}</p>
                </div>
                <div class="underbox_stock_info">
                    <p class="stock_info_keys">주식 시가</p>
                    <p class="stock_info_values">${stock_info_data[1]}</p>
                </div>
                <div class="underbox_stock_info">
                    <p class="stock_info_keys">주식 최고가</p>
                    <p class="stock_info_values">${stock_info_data[2]}</p>
                </div>
                <div class="underbox_stock_info">
                    <p class="stock_info_keys">주식 최저가</p>
                    <p class="stock_info_values">${stock_info_data[3]}</p>
                </div>
            </div>
        </underbox>
        <script>Highcharts.chart('container', {
                title:{
                text : '${stock_data[0]} 분봉데이터'
            },
            chart: {
                backgroundColor: '#FFFFFF',
                type: 'line',
            },
            legend: {
                enabled:false
            },
            xAxis: {
                title : {
                    enabled : false
                },
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug','Sep', 'Oct', 'Nov', 'Dec'],
            },
            yAxis: {
                title : {
                    enabled : false
                }
            },
            series: [{
                name : '분봉데이터',
                data: ${stock_1m_data}
            }]
        });</script>
    ${script}
    </body>
    </html>`;
  },
  /** */
  not_found_page :function(css_list = []){
    var css = '';
    css_list.map((css_element)=>{
      css += `<style>${css_element}</style>`
    })
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
  ${css}
      <title>Winter-Project</title>
      <meta charset="UTF-8">
      <script src="https://code.highcharts.com/highcharts.js"></script>
  </head>
  <body>
      <!-- 제목과 검색창이있는 top태그 -->
      <nav class="top">
          <!-- 제목이 적혀있는 h1태그 -->
          <h1 class="title__box__name">Stock File<br>Stockholm
              <line class="title__line"></line>
          </h1>
          <!-- 검색창이 있는 form태그 -->
          <form class="title__search" method="post">
              <input type="text" placeholder="enter the stock name">
          </form>
      </nav>
      <div>없는 종목을 입력하였습니다.</div>
    </body>
    </html>`}
}

//초기 화면 불러오기
server.get("/", (req, res) => {
  res.send(html.hompage([fs.readFileSync('./css/title.css','utf8')]));
});



// post로 검색창의 입력값 받아오기
server.post("/", (req, res) => {
  /** 종목 한글명 */
  const stock_kr_string = req.body.stock;

  const conn = JSON.parse(fs.readFileSync("SoloData/SoloData.json"));
  let connection = createConnection(conn); // DB 커넥션 생성

  connection.connect((err) => {
    if (err) console.log(err);
    else console.log("Connected successfully");
  });

  /**입력정보로 종목코드를 뽑아오는 sql 명령문*/
  let select_sql = `SELECT 단축코드 FROM stock WHERE 한글명="${stock_kr_string}";`;
  connection.query(select_sql, function (err, respone) {
    if (err) console.log(err);
    else {
      //사용자가 없는 종목을 입력했을때
      if(respone.length==0)
      res.send(html.not_found_page([fs.readFileSync('./css/title.css','utf8')]))
      else{
        /** 종목코드 */
        console.log(respone);
        const stock_code = respone[0]["단축코드"];
        console.log(stock_code);
        //검색한 종목의 정보를 데이터 베이스에 저장하기
        broker.fetch_price(stock_code).then(
          /** @param {Object} stock_info fetch_price로 가져온 Object형 변수*/
          function (stock_info) {
            // 여러 사용자가 데이터를 입력할 때 한 테이블에 쓰면 충돌이 발생할 것이기 때문에
            // 주식마다 주식정보, 분봉 테이블을 생성시킨다. 존재할 시 데이터 바로 입력
            let create_sql = `CREATE TABLE ${stock_kr_string}info ( 
            ${Object.keys(stock_info).join(` VARCHAR(50),
            `)} VARCHAR(50)
            );`;
            //테이블 생성
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
  
        //검색한 종목의 분봉데이터를 데이터 베이스에 저장하기
        broker.fetch_today_1m_ohlcv(stock_code, "").then(
          /** @param {Array<Array<string>>} mindata 분봉데이터 2차원배열*/
          function (mindata) {
            let create_sql = `CREATE TABLE ${stock_kr_string}분봉 ( 
              ${stock_1m_columns.join(` VARCHAR(50),
              `)} VARCHAR(50)
              );`;
            //테이블 생성
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
              //db에 데이터 저장
              connection.query(insert_sql, [mindata], function (err, results) {
                if (err) console.log(err);
                else console.log("save succesfully");
                connection.end();
              });
            });
          }
        );
      }
    }
  });  
});

