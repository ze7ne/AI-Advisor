from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from datetime import date, datetime
from typing import Optional, List
import models
import schemas

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/", response_model=List[schemas.ExpenseOut])
def get_expenses(
    month: Optional[int] = None,
    year: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Expense)
    if month:
        query = query.filter(extract("month", models.Expense.date) == month)
    if year:
        query = query.filter(extract("year", models.Expense.date) == year)
    if category:
        query = query.filter(models.Expense.category == category)
    return query.order_by(models.Expense.date.desc()).all()


@router.post("/", response_model=schemas.ExpenseOut)
def create_expense(data: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    expense = models.Expense(**data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"ok": True}


@router.get("/categories")
def get_categories():
    return [
        "Еда и напитки",
        "Транспорт",
        "Жильё",
        "Развлечения",
        "Одежда",
        "Здоровье",
        "Образование",
        "Связь",
        "Путешествия",
        "Прочее"
    ]
