import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Use DATABASE_URL from environment (Neon PostgreSQL on production)
# Falls back to local SQLite for development
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Neon/PostgreSQL — no special connect_args needed
    engine = create_engine(DATABASE_URL)
else:
    # Local development — SQLite
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "perfume_app.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
