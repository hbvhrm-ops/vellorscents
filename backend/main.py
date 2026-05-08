import os
import sys

# Ensure the backend directory is always in the Python path,
# regardless of which directory uvicorn is launched from.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

import models, schemas
from database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Perfume Sales API")

# CORS — allow the Render frontend URL and local dev
origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH ---
@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    if request.username == "69" and request.password == "69":
        return {"role": "admin", "reseller_id": None}
    
    reseller = db.query(models.Reseller).filter(
        models.Reseller.username == request.username,
        models.Reseller.password == request.password
    ).first()
    
    if reseller:
        return {"role": "reseller", "reseller_id": reseller.id}
    
    raise HTTPException(status_code=401, detail="Invalid username or password")

# --- PRODUCTS ---
@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()

@app.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"detail": "Product deleted successfully"}

# --- RESELLERS ---
@app.post("/resellers/", response_model=schemas.Reseller)
def create_reseller(reseller: schemas.ResellerCreate, db: Session = Depends(get_db)):
    db_reseller = models.Reseller(**reseller.model_dump())
    db.add(db_reseller)
    db.commit()
    db.refresh(db_reseller)
    return db_reseller

@app.get("/resellers/", response_model=List[schemas.Reseller])
def read_resellers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Reseller).offset(skip).limit(limit).all()

@app.delete("/resellers/{reseller_id}")
def delete_reseller(reseller_id: int, db: Session = Depends(get_db)):
    db_reseller = db.query(models.Reseller).filter(models.Reseller.id == reseller_id).first()
    if not db_reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    # optionally set reseller_id to null in sales
    db.query(models.Sale).filter(models.Sale.reseller_id == reseller_id).update({"reseller_id": None})
    db.delete(db_reseller)
    db.commit()
    return {"detail": "Reseller deleted successfully"}

@app.put("/resellers/{reseller_id}", response_model=schemas.Reseller)
def update_reseller(reseller_id: int, reseller: schemas.ResellerCreate, db: Session = Depends(get_db)):
    db_reseller = db.query(models.Reseller).filter(models.Reseller.id == reseller_id).first()
    if not db_reseller:
        raise HTTPException(status_code=404, detail="Reseller not found")
    for key, value in reseller.model_dump().items():
        setattr(db_reseller, key, value)
    db.commit()
    db.refresh(db_reseller)
    return db_reseller

# --- SALES ---
@app.post("/sales/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    db_sale = models.Sale(**sale.model_dump())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db.query(models.Sale).filter(models.Sale.id == db_sale.id).first()

@app.get("/sales/", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, reseller_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Sale)
    if reseller_id is not None:
        query = query.filter(models.Sale.reseller_id == reseller_id)
    return query.order_by(models.Sale.date.desc()).offset(skip).limit(limit).all()

@app.put("/sales/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    for key, value in sale.model_dump().items():
        setattr(db_sale, key, value)
    db.commit()
    db.refresh(db_sale)
    return db.query(models.Sale).filter(models.Sale.id == db_sale.id).first()

@app.delete("/sales/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    db.delete(db_sale)
    db.commit()
    return {"detail": "Sale deleted successfully"}

# --- DEBTS ---
@app.get("/debts/", response_model=List[schemas.Sale])
def read_debts(skip: int = 0, limit: int = 100, reseller_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Sale).filter(models.Sale.total_price > models.Sale.amount_paid)
    if reseller_id is not None:
        query = query.filter(models.Sale.reseller_id == reseller_id)
    return query.order_by(models.Sale.date.desc()).offset(skip).limit(limit).all()

@app.post("/sales/{sale_id}/pay/")
def pay_debt(sale_id: int, amount: float, db: Session = Depends(get_db)):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.amount_paid + amount > sale.total_price:
        sale.amount_paid = sale.total_price
    else:
        sale.amount_paid += amount
    db.commit()
    db.refresh(sale)
    return {"message": "Payment recorded", "sale": sale}

# --- SERVE STATIC FRONTEND (local dev only) ---
if not os.environ.get("DATABASE_URL"):
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
    if os.path.exists(frontend_dist):
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}")
        def serve_frontend(full_path: str):
            if full_path.split("/")[0] in ["products", "sales", "resellers", "debts"]:
                raise HTTPException(status_code=404, detail="API Route Not Found")
            file_path = os.path.join(frontend_dist, full_path)
            if os.path.isfile(file_path):
                return FileResponse(file_path)
            return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
