from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ProfileBase(BaseModel):
    monthly_salary: float
    current_savings: float
    monthly_savings_target: float
    currency: str = "KZT"


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    id: int
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: date


class ExpenseOut(ExpenseCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    deadline: date
    priority: str = "medium"
    icon: str = "🏠"


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[date] = None
    priority: Optional[str] = None
    icon: Optional[str] = None


class GoalOut(GoalCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class AdvisorRequest(BaseModel):
    question: str
    purchase_amount: Optional[float] = None
    purchase_name: Optional[str] = None


class AdvisorResponse(BaseModel):
    recommendation: str
    can_afford: bool
    impact_analysis: str
    timeline_projection: str
    advice_score: int


class DashboardData(BaseModel):
    monthly_salary: float
    current_savings: float
    monthly_savings_target: float
    total_expenses_this_month: float
    savings_rate: float
    expenses_by_category: dict
    recent_expenses: list
    goals: list
    monthly_trend: list
    currency: str
