from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    question: str
    answer: str


class TripCreate(BaseModel):
    destination: str
    country: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str = "Solo"


class TripUpdate(BaseModel):
    budget: float


class TripResponse(BaseModel):
    id: int
    user_id: int
    destination: str
    country: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str
    category: str
    daily_budget: float
    ai_recommendation: Optional[str] = None

    class Config:
        from_attributes = True
