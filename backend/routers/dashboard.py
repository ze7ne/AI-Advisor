from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from datetime import datetime, date
import models
import schemas

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=schemas.DashboardData)
def get_dashboard(db: Session = Depends(get_db)):
    profile = db.query(models.Profile).first()
    if not profile:
        profile = models.Profile(monthly_salary=0, current_savings=0, monthly_savings_target=0)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    now = datetime.now()

    total_expenses_this_month = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        extract("month", models.Expense.date) == now.month,
        extract("year", models.Expense.date) == now.year
    ).scalar() or 0

    expenses_by_category_raw = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label("total")
    ).filter(
        extract("month", models.Expense.date) == now.month,
        extract("year", models.Expense.date) == now.year
    ).group_by(models.Expense.category).all()

    expenses_by_category = {cat: float(total) for cat, total in expenses_by_category_raw}

    recent_expenses_raw = db.query(models.Expense).order_by(
        models.Expense.date.desc()
    ).limit(10).all()

    recent_expenses = [
        {
            "id": e.id,
            "amount": e.amount,
            "category": e.category,
            "description": e.description,
            "date": e.date.isoformat()
        }
        for e in recent_expenses_raw
    ]

    goals_raw = db.query(models.Goal).order_by(models.Goal.deadline).all()
    goals = [
        {
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "deadline": g.deadline.isoformat(),
            "priority": g.priority,
            "icon": g.icon,
            "progress": round((g.current_amount / g.target_amount) * 100, 1) if g.target_amount > 0 else 0
        }
        for g in goals_raw
    ]

    monthly_trend = []
    for i in range(5, -1, -1):
        month_num = (now.month - i - 1) % 12 + 1
        year_num = now.year if now.month - i > 0 else now.year - 1
        total = db.query(func.sum(models.Expense.amount)).filter(
            extract("month", models.Expense.date) == month_num,
            extract("year", models.Expense.date) == year_num
        ).scalar() or 0
        monthly_trend.append({
            "month": date(year_num, month_num, 1).strftime("%b"),
            "amount": float(total)
        })

    savings_rate = 0
    if profile.monthly_salary > 0:
        net = profile.monthly_salary - total_expenses_this_month
        savings_rate = round((net / profile.monthly_salary) * 100, 1)

    return schemas.DashboardData(
        monthly_salary=profile.monthly_salary,
        current_savings=profile.current_savings,
        monthly_savings_target=profile.monthly_savings_target,
        total_expenses_this_month=float(total_expenses_this_month),
        savings_rate=savings_rate,
        expenses_by_category=expenses_by_category,
        recent_expenses=recent_expenses,
        goals=goals,
        monthly_trend=monthly_trend,
        currency=profile.currency
    )
