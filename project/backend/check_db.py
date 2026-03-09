import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_server = os.getenv("DB_SERVER", "localhost")
db_name = os.getenv("DB_NAME", "microservice")
db_user = os.getenv("DB_USER", "sa")
db_password = os.getenv("DB_PASSWORD", "Admin@123")

conn_str = f"mssql+pyodbc://{db_user}:{db_password}@{db_server}/{db_name}?driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(conn_str)

with engine.connect() as conn:
    res = conn.execute(text("SELECT RF_DisplayName, RF_IsMeasure FROM ReportingFields WHERE RF_IsMeasure = 1"))
    for row in res:
        print(row)
