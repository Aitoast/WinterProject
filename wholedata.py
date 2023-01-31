import mojito  #한국투자증권에서 필요한 모듈
import pandas as pd 
from sqlalchemy import create_engine
import json #각자의 DB정보를 딕셔너리로 가져오는 json모듈

f = open("Mykey.txt")  #text 파일을 만들고appkey,secretkey,계좌번호를 저장한다.
lines = f.readlines()
key = lines[0].strip()
secret = lines[1].strip()
acc_no = lines[2].strip()
f.close()

broker = mojito.KoreaInvestment(  #브로커객체를 생성(broker.broker파일 생성)
	api_key=key,
	api_secret=secret,
	acc_no=acc_no
)

symbols = broker.fetch_symbols() # 전체 종목코드를 가져와 테이블에 넣는다. 
sym=pd.DataFrame(symbols)
print(sym)

#solo_data변수에 딕셔너리로 담기
with open('./SoloData/sqlData.json') as f:
  solo_data = json.load(f)


db_connection_str =f'mysql+pymysql://{solo_data["user"]}:{solo_data["password"]}@{solo_data["host"]}/{solo_data["database"]}?charset=utf8'
db_connection = create_engine(db_connection_str)
conn = db_connection.connect()

sym.to_sql(name='hey',con=db_connection,if_exists='replace', index=False)# pandas dataframe으로 받아온 데이터를 mysql에 저장 

conn.close()