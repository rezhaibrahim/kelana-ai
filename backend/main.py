from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from auth import create_access_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from services.trip_service import get_trip_category, calculate_daily_budget
from services.bedrock_service import generate_itinerary
from services.knowledge_base_service import ask_knowledge_base, ask_knowledge_base_with_history

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KelanaAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/recommendations")
def get_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations")
def get_transportations():
    return ["Bus", "Train", "Flight"]


@app.post("/api/v1/auth/register", response_model=schemas.UserResponse, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/v1/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return schemas.Token(access_token=create_access_token(user))


@app.post("/api/v1/ask", response_model=schemas.AskResponse)
def ask(
    payload: schemas.AskRequest,
    current_user: models.User = Depends(get_current_user),
):
    answer = ask_knowledge_base(payload.question)
    return schemas.AskResponse(question=payload.question, answer=answer)


def _build_title(content: str) -> str:
    stripped = content.strip()
    return stripped if len(stripped) <= 50 else stripped[:50] + "..."


@app.post("/api/v1/conversations", response_model=schemas.ConversationDetailResponse, status_code=201)
def create_conversation(
    payload: schemas.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    conversation = models.Conversation(user_id=current_user.id, title=_build_title(payload.content))
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    user_message = models.Message(conversation_id=conversation.id, role="user", content=payload.content)
    db.add(user_message)
    db.commit()

    answer = ask_knowledge_base_with_history(payload.content, history=[])

    assistant_message = models.Message(conversation_id=conversation.id, role="assistant", content=answer)
    db.add(assistant_message)
    db.commit()

    conversation.messages = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conversation.id)
        .order_by(models.Message.created_at.asc())
        .all()
    )
    return conversation


@app.get("/api/v1/conversations", response_model=list[schemas.ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Conversation)
        .filter(models.Conversation.user_id == current_user.id)
        .order_by(models.Conversation.created_at.desc())
        .all()
    )


@app.get("/api/v1/conversations/{conversation_id}", response_model=schemas.ConversationDetailResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if conversation is None or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.messages = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.created_at.asc())
        .all()
    )
    return conversation


@app.post("/api/v1/conversations/{conversation_id}/messages", response_model=schemas.SendMessageResponse)
def send_message(
    conversation_id: int,
    payload: schemas.SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if conversation is None or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    prior_messages = (
        db.query(models.Message)
        .filter(models.Message.conversation_id == conversation_id)
        .order_by(models.Message.created_at.asc())
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in prior_messages]

    user_message = models.Message(conversation_id=conversation_id, role="user", content=payload.content)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    answer = ask_knowledge_base_with_history(payload.content, history=history)

    assistant_message = models.Message(conversation_id=conversation_id, role="assistant", content=answer)
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return schemas.SendMessageResponse(user_message=user_message, assistant_message=assistant_message)


@app.post("/api/v1/trips", response_model=schemas.TripResponse)
def create_trip(
    trip: schemas.TripCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    category = get_trip_category(trip.budget)
    daily_budget = calculate_daily_budget(trip.budget, trip.days)

    db_trip = models.Trip(
        **trip.model_dump(),
        category=category,
        daily_budget=daily_budget,
        user_id=current_user.id,
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@app.get("/api/v1/trips", response_model=list[schemas.TripResponse])
def list_trips(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Trip).filter(models.Trip.user_id == current_user.id).all()


@app.get("/api/v1/trips/{trip_id}", response_model=schemas.TripResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None or db_trip.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db_trip


@app.put("/api/v1/trips/{trip_id}", response_model=schemas.TripResponse)
def update_trip(
    trip_id: int,
    trip: schemas.TripUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if db_trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this trip")

    db_trip.budget = trip.budget
    db_trip.category = get_trip_category(trip.budget)
    db_trip.daily_budget = calculate_daily_budget(trip.budget, db_trip.days)

    db.commit()
    db.refresh(db_trip)
    return db_trip


@app.post("/api/v1/trips/{trip_id}/generate", response_model=schemas.TripResponse)
def generate_trip_recommendation(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if db_trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this trip")

    itinerary = generate_itinerary(
        destination=db_trip.destination,
        country=db_trip.country,
        days=db_trip.days,
        budget=db_trip.budget,
        currency=db_trip.currency,
        travel_month=db_trip.travel_month,
        category=db_trip.category,
    )

    db_trip.ai_recommendation = itinerary
    db.commit()
    db.refresh(db_trip)
    return db_trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if db_trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this trip")

    db.delete(db_trip)
    db.commit()
    return {"detail": f"Trip {trip_id} deleted"}
