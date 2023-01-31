import mojito  #한국투자증권에서 필요한 모듈
import pandas as pd #pands 사용
from sqlalchemy import create_engine
import sys #js의 인자를 받기 위한 모듈
import json #각자의 DB정보를 딕셔너리로 가져오는 json모듈


f = open("Mykey.txt")  #text 파일을 열고 appkey,secretkey,계좌번호를 저장한다.
lines = f.readlines()
key = lines[0].strip()
secret = lines[1].strip()
acc_no = lines[2].strip()
f.close()

#solo_data변수에 딕셔너리로 담기
with open('./SoloData/sqlData.json') as f:
  solo_data = json.load(f)

broker = mojito.KoreaInvestment(  #브로커객체를 생성
	api_key=key,
	api_secret=secret,
	acc_no=acc_no
)

response = broker.fetch_price(sys.argv[1]) #server.js 69번째 줄의 인자를 사용하기 위해 사용 

res=pd.DataFrame(response)

db_connection_str =f'mysql+pymysql://{solo_data["user"]}:{solo_data["password"]}@{solo_data["host"]}/{solo_data["database"]}?charset=utf8'
db_connection = create_engine(db_connection_str)
conn = db_connection.connect()

res.to_sql(name='boy',con=db_connection,if_exists='replace', index=False)

conn.close()