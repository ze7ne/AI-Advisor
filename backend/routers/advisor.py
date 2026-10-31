from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
from datetime import date, datetime
import models
import schemas
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()

router = APIRouter(prefix="/api/advisor", tags=["advisor"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))


def build_financial_context(db: Session) -> dict:
    profile = db.query(models.Profile).first()
    now = datetime.now()

    monthly_expenses = db.query(
        func.sum(models.Expense.amount)
    ).filter(
        extract("month", models.Expense.date) == now.month,
        extract("year", models.Expense.date) == now.year
    ).scalar() or 0

    expenses_by_category = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label("total")
    ).filter(
        extract("month", models.Expense.date) == now.month,
        extract("year", models.Expense.date) == now.year
    ).group_by(models.Expense.category).all()

    goals = db.query(models.Goal).order_by(models.Goal.deadline).all()

    return {
        "monthly_salary": profile.monthly_salary if profile else 0,
        "current_savings": profile.current_savings if profile else 0,
        "monthly_savings_target": profile.monthly_savings_target if profile else 0,
        "currency": profile.currency if profile else "KZT",
        "monthly_expenses": monthly_expenses,
        "expenses_by_category": {cat: float(total) for cat, total in expenses_by_category},
        "goals": [
            {
                "name": g.name,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "deadline": g.deadline.isoformat(),
                "priority": g.priority,
                "remaining": g.target_amount - g.current_amount
            }
            for g in goals
        ]
    }


@router.post("/analyze", response_model=schemas.AdvisorResponse)
async def analyze(request: schemas.AdvisorRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(status_code=400, detail="Gemini API key not configured")

    ctx = build_financial_context(db)

    prompt = f"""
Ты — персональный финансовый советник. Проанализируй финансовую ситуацию пользователя и дай конкретный совет.

ФИНАНСОВЫЕ ДАННЫЕ:
- Ежемесячная зарплата: {ctx['monthly_salary']:,.0f} {ctx['currency']}
- Текущие накопления: {ctx['current_savings']:,.0f} {ctx['currency']}
- Цель по накоплениям в месяц: {ctx['monthly_savings_target']:,.0f} {ctx['currency']}
- Расходы за этот месяц: {ctx['monthly_expenses']:,.0f} {ctx['currency']}
- Расходы по категориям: {json.dumps(ctx['expenses_by_category'], ensure_ascii=False)}

ЦЕЛИ ПОЛЬЗОВАТЕЛЯ:
{json.dumps(ctx['goals'], ensure_ascii=False, indent=2)}

ВОПРОС ПОЛЬЗОВАТЕЛЯ: {request.question}
{f"Рассматриваемая покупка: {request.purchase_name} за {request.purchase_amount:,.0f} {ctx['currency']}" if request.purchase_amount else ""}

Проанализируй и верни ответ СТРОГО в формате JSON (без markdown-блоков, только JSON):
{{
  "recommendation": "Краткая рекомендация 2-3 предложения",
  "can_afford": true/false,
  "impact_analysis": "Детальный анализ влияния на бюджет и цели",
  "timeline_projection": "Прогноз достижения целей при разных сценариях",
  "advice_score": число от 1 до 10 (насколько выгодно совершать покупку/действие сейчас)
}}
"""

    try:
        model = genai.GenerativeModel("gemini-3-flash-preview")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text)
        return schemas.AdvisorResponse(**data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
