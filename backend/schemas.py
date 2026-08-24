from typing import Optional

from pydantic import BaseModel


class TripCreate(BaseModel):
    destination: str
    country: str
    days: int
    budget: float
    currency: str
    travel_month: str


class TripUpdate(BaseModel):
    budget: float


class TripResponse(BaseModel):
    id: int
    destination: str
    country: str
    days: int
    budget: float
    currency: str
    travel_month: str
    category: str
    daily_budget: float
    ai_recommendation: Optional[str] = None

    class Config:
        from_attributes = True
