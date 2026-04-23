from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    price: float
    wholesale_price: float = 0.0
    cost_price: float = 0.0
    wholesale_cost_price: float = 0.0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class ResellerBase(BaseModel):
    name: str
    contact: Optional[str] = None

class ResellerCreate(ResellerBase):
    pass

class Reseller(ResellerBase):
    id: int

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    customer_name: str
    perfume_name: str
    quantity: int = 1
    total_price: float
    total_cost: float = 0.0
    discount: float = 0.0
    amount_paid: float = 0.0
    product_id: Optional[int] = None
    reseller_id: Optional[int] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    date: datetime
    product: Optional[Product] = None
    reseller: Optional[Reseller] = None

    class Config:
        from_attributes = True
