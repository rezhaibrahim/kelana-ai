from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db
from services.trip_service import get_trip_category, calculate_daily_budget
from services.bedrock_service import generate_itinerary

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KelanaAI API")


@app.get("/api/v1/recommendations")
def get_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]


@app.get("/api/v1/transportations")
def get_transportations():
    return ["Bus", "Train", "Flight"]


@app.post("/api/v1/trips", response_model=schemas.TripResponse)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    category = get_trip_category(trip.budget)
    daily_budget = calculate_daily_budget(trip.budget, trip.days)

    db_trip = models.Trip(
        **trip.model_dump(),
        category=category,
        daily_budget=daily_budget,
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@app.get("/api/v1/trips", response_model=list[schemas.TripResponse])
def list_trips(db: Session = Depends(get_db)):
    return db.query(models.Trip).all()


@app.get("/api/v1/trips/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db_trip


@app.put("/api/v1/trips/{trip_id}", response_model=schemas.TripResponse)
def update_trip(trip_id: int, trip: schemas.TripUpdate, db: Session = Depends(get_db)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_trip.budget = trip.budget
    db_trip.category = get_trip_category(trip.budget)
    db_trip.daily_budget = calculate_daily_budget(trip.budget, db_trip.days)

    db.commit()
    db.refresh(db_trip)
    return db_trip


@app.post("/api/v1/trips/{trip_id}/generate", response_model=schemas.TripResponse)
def generate_trip_recommendation(trip_id: int, db: Session = Depends(get_db)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

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
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(db_trip)
    db.commit()
    return {"detail": f"Trip {trip_id} deleted"}
