from sqlalchemy import create_engine, Column, String, Boolean, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import datetime

# ... (connection setup)

# ...

class Tenant(Base):
    __tablename__ = "tenant"

    id = Column(String, primary_key=True, index=True)
    shop_name = Column(String)
    access_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    config = Column(JSON, nullable=True) # Stores prizes, messages, patterns
    
    totalSpins = Column(Integer, default=0)
    totalPrizes = Column(Integer, default=0)
    totalUsers = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoice"
    
    id = Column(String, primary_key=True, index=True) # invoice_id
    page_id = Column(String, index=True)
    sender_id = Column(String, index=True)
    prize_won = Column(String)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
