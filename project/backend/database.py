import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DB_SERVER = os.getenv("DB_SERVER", "localhost")
DB_DATABASE = os.getenv("DB_DATABASE", "MaestraVistaReporting")
DB_USER = os.getenv("DB_USER", "sa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Password123")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")


def get_connection_url() -> str:
    driver = quote_plus(DB_DRIVER)
    user = quote_plus(DB_USER)
    password = quote_plus(DB_PASSWORD)
    server = quote_plus(DB_SERVER)
    database = quote_plus(DB_DATABASE)
    return f"mssql+pyodbc://{user}:{password}@{server}/{database}?driver={driver}"


engine = create_engine(get_connection_url(), pool_pre_ping=True)
