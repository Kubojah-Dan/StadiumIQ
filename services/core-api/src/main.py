from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from . import models, schemas, database, auth
from .database import get_db

app = FastAPI(title="StadiumIQ Core API", version="0.1.0")

@app.on_event("startup")
async def on_startup():
    async with database.engine.begin() as conn:
        # In production use Alembic; auto-create tables for local testing
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "ok", "service": "core-api"}

@app.get("/venues", response_model=List[schemas.VenueResponse])
async def get_venues(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Venue))
    venues = result.scalars().all()
    return venues

@app.post("/venues", response_model=schemas.VenueResponse)
async def create_venue(venue: schemas.VenueBase, db: AsyncSession = Depends(get_db)):
    db_venue = models.Venue(**venue.model_dump())
    db.add(db_venue)
    await db.commit()
    await db.refresh(db_venue)
    return db_venue
