from sqlalchemy import Column, Integer, Float, String, DateTime, Date, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    monthly_salary = Column(Float, default=0)
    current_savings = Column(Float, default=0)
    monthly_savings_target = Column(Float, default=0)
    currency = Column(String, default="KZT")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0)
    deadline = Column(Date, nullable=False)
    priority = Column(String, default="medium")
    icon = Column(String, default="🏠")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
