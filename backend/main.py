from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import profile, expenses, goals, advisor, dashboard

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(expenses.router)
app.include_router(goals.router)
app.include_router(advisor.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Finance Portfolio API"}
