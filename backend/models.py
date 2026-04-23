from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    wholesale_price = Column(Float, default=0.0)
    cost_price = Column(Float, default=0.0)
    wholesale_cost_price = Column(Float, default=0.0)
    
    sales = relationship("Sale", back_populates="product")

class Reseller(Base):
    __tablename__ = "resellers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact = Column(String, nullable=True)
    
    sales = relationship("Sale", back_populates="reseller")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    reseller_id = Column(Integer, ForeignKey("resellers.id"), nullable=True)
    
    perfume_name = Column(String, nullable=False, index=True)
    customer_name = Column(String, index=True)
    quantity = Column(Integer, default=1)
    total_price = Column(Float)
    total_cost = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    amount_paid = Column(Float, default=0.0)
    
    date = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="sales")
    reseller = relationship("Reseller", back_populates="sales")
