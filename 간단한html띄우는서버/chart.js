Highcharts.chart('container', {
  //제목 설정 속성
  title:{
    text : '주제목'
  },
  //부제목 설정 속성
  subtitle:{
    text : '부제목'
  },
  //차트의 색이나  type을 지정하는 속성
  chart: {
      //배경색을 설정
      backgroundColor: '#FCFFC5',
      //꺽은선으로 설정
      type: 'line',
      withd : 300,
      height : 300
  },
  //x축에 표시될 데이터들을 지정하는 속성
  xAxis: {
      //x축 데이터의 제목을 설정하는 title 속성 안 text속성에 제목을 입력할수있다.
      title : {text : 'x축 제목'},
      //categories속성으로 x축데이터를 배열로 설정할수있다.
      //중요한건 데이터 갯수에 맞게만 출력된다. 데이터가 1개라면 jan만 뜬다
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
          'Sep', 'Oct', 'Nov', 'Dec'],
      //x축이 어떻게 보일것인지 설정
      labels:{
        //스타일 속성에 color속성으로 글자색 변경가능
        style: {color:'red'}
      }
  },
  //y축도 x축과 동일하다
  yAxis: {
    title : {
      text : "y축 제목"
    }
  },
  series: [{
      name : '데이터 제목 설정',
      data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4,
          194.1, 95.6, 54.4]
  }]
});