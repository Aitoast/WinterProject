import express from "express";
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
//html 템플릿 생성
var html = {
  //홈페이지는 css, script를 읽은뒤 html 문자열을 반환함
  hompage : function(css,script){
    return `<style>
    ${css}
  </style>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <div id="container"></div>
  <script>${script}</script>`
  }
}



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})