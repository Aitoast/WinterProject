import express from "express";
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

  //입력정보로 종목코드를 뽑아오는 sql 명령문
  let sql = `SELECT 단축코드 FROM solodb.stock WHERE 한글명="${stock_kr_string}";`;
  connection.query(sql, function (err, respone) {
    if (err) console.log(err);
    else {
      /** 종목코드 */
      const stock_code = respone[0]["단축코드"];
      console.log(stock_code);
      broker.fetch_price(stock_code).then(function (stocka) {
        // 여러 사용자가 데이터를 입력할 때 한 테이블에 쓰면 충돌이 발생할 것이기 때문에
        // 주식마다 주식정보, 분봉 테이블을 생성시킨다. 존재할 시 데이터 바로 입력
        let make = `CREATE TABLE solodb.${stock_kr_string}info ( 
          iscd_stat_cls_code VARCHAR(50),
          marg_rate  VARCHAR(50),
          rprs_mrkt_kor_name VARCHAR(50),
          bstp_kor_isnm VARCHAR(50),
          temp_stop_yn VARCHAR(50),
          oprc_rang_cont_yn VARCHAR(50),
          clpr_rang_cont_yn VARCHAR(50),
          crdt_able_yn VARCHAR(50),
          grmn_rate_cls_code VARCHAR(50),
          elw_pblc_yn VARCHAR(50),
          stck_prpr VARCHAR(50),
          prdy_vrss VARCHAR(50),
          prdy_vrss_sign VARCHAR(50),
          prdy_ctrt VARCHAR(50),
          acml_tr_pbmn VARCHAR(50),
          acml_vol VARCHAR(50),
          prdy_vrss_vol_rate VARCHAR(50),
          stck_oprc VARCHAR(50),
          stck_hgpr VARCHAR(50),
          stck_lwpr VARCHAR(50),
          stck_mxpr VARCHAR(50),
          stck_llam VARCHAR(50),
          stck_sdpr VARCHAR(50),
          wghn_avrg_stck_prc VARCHAR(50),
          hts_frgn_ehrt VARCHAR(50),
          frgn_ntby_qty VARCHAR(50),
          pgtr_ntby_qty VARCHAR(50),
          pvt_scnd_dmrs_prc VARCHAR(50),
          pvt_frst_dmrs_prc VARCHAR(50),
          pvt_pont_val VARCHAR(50),
          pvt_frst_dmsp_prc VARCHAR(50),
          pvt_scnd_dmsp_prc VARCHAR(50),
          dmrs_val VARCHAR(50),
          dmsp_val VARCHAR(50),
          cpfn VARCHAR(50),
          rstc_wdth_prc VARCHAR(50),
          stck_fcam VARCHAR(50),
          stck_sspr VARCHAR(50),
          aspr_unit VARCHAR(50),
          hts_deal_qty_unit_val VARCHAR(50),
          lstn_stcn VARCHAR(50),
          hts_avls VARCHAR(50),
          per VARCHAR(50),
          pbr VARCHAR(50),
          stac_month VARCHAR(50),
          vol_tnrt VARCHAR(50),
          eps VARCHAR(50),
          bps VARCHAR(50),
          d250_hgpr VARCHAR(50),
          d250_hgpr_date VARCHAR(50),
          d250_hgpr_vrss_prpr_rate VARCHAR(50),
          d250_lwpr VARCHAR(50),
          d250_lwpr_date VARCHAR(50),
          d250_lwpr_vrss_prpr_rate VARCHAR(50),
          stck_dryy_hgpr VARCHAR(50),
          dryy_hgpr_vrss_prpr_rate VARCHAR(50),
          dryy_hgpr_date VARCHAR(50),
          stck_dryy_lwpr VARCHAR(50),
          dryy_lwpr_vrss_prpr_rate VARCHAR(50),
          dryy_lwpr_date VARCHAR(50),
          w52_hgpr VARCHAR(50),
          w52_hgpr_vrss_prpr_ctrt VARCHAR(50),
          w52_hgpr_date VARCHAR(50),
          w52_lwpr VARCHAR(50),
          w52_lwpr_vrss_prpr_ctrt VARCHAR(50),
          w52_lwpr_date VARCHAR(50),
          whol_loan_rmnd_rate VARCHAR(50),
          ssts_yn VARCHAR(50),
          stck_shrn_iscd VARCHAR(50),
          fcam_cnnm VARCHAR(50),
          cpfn_cnnm VARCHAR(50),
          frgn_hldn_qty VARCHAR(50),
          vi_cls_code VARCHAR(50),
          ovtm_vi_cls_code VARCHAR(50),
          last_ssts_cntg_qty VARCHAR(50),
          invt_caful_yn VARCHAR(50),
          mrkt_warn_cls_code VARCHAR(50),
          short_over_yn VARCHAR(50),
          sltr_yn VARCHAR(50)
          );`;
        connection.query(make, function (err, results) {
          if (err) {
            let del = `DELETE FROM solodb.${stock_kr_string}info; `; // 원래 테이블을 초기화 시키는 명령문
            connection.query(del, function (err, results) {
              if (err) console.log(err);
              else console.log("delete succesfully");
            });
          } else console.log("create table succesfully");
            let savein = `INSERT INTO solodb.${stock_kr_string}info SET ?;`;
            connection.query(savein, stocka, function (err, results) {
              if (err) console.log(err);
              else console.log("save succesfully");
            });
        });
      });

      broker
        .fetch_today_1m_ohlcv(stock_code, "")
        .then(function (mindata) {
          // 데이터는 2차원배열로 받아 b에 넣는다.
          var b = mindata;
          var makemin = `CREATE TABLE solodb.${stock_kr_string}분봉( 
            stck_bsop_date VARCHAR(50),
              stck_cntg_hour VARCHAR(50),
              stck_prpr VARCHAR(50),
              stck_oprc VARCHAR(50),
              stck_hgpr VARCHAR(50),
              stck_lwpr VARCHAR(50),
              cntg_vol VARCHAR(50),
              acml_tr_pbmn VARCHAR(50)
            );`;
          connection.query(makemin, function (err, results) {
            if (err) {
              let del = `DELETE FROM solodb.${stock_kr_string}분봉; `; // 원래 테이블을 초기화 시키는 명령문
              connection.query(del, function (err, results) {
                if (err) console.log(err);
                else console.log("delete succesfully");
              });
            } else console.log("create table succesfully");
            var cha = `INSERT INTO ${stock_kr_string}분봉 values ?;`;
            connection.query(cha, [b], function (err, results) {
              if (err) console.log(err);
              else console.log("save succesfully");
              connection.end();
            });
          });
        });
      }
    });    
  });
