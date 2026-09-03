from datetime import datetime
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


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    content: str


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []


class SendMessageRequest(BaseModel):
    content: str


class SendMessageResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse


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
