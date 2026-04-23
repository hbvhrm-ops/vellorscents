import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

if getattr(sys, 'frozen', False):
    old_application_path = os.path.dirname(sys.executable)
else:
    old_application_path = os.path.dirname(os.path.abspath(__file__))

# Data persistence: Save to APPDATA so we don't lose data on rebuild/close
app_data = os.environ.get('LOCALAPPDATA') or os.path.expanduser('~')
app_dir = os.path.join(app_data, "VellorSystem")
os.makedirs(app_dir, exist_ok=True)

db_path = os.path.join(app_dir, "perfume_app.db")
old_db_path = os.path.join(old_application_path, "perfume_app.db")

# Automatically migrate data if the user has an old DB and a new one hasn't been created yet
if not os.path.exists(db_path) and os.path.exists(old_db_path):
    import shutil
    try:
        shutil.copy2(old_db_path, db_path)
    except Exception:
        pass

SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
