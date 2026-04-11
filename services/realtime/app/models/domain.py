from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="fan") # fan, staff, admin, security
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Venue(Base):
    __tablename__ = "venues"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    capacity = Column(Integer)
    layout_data = Column(JSON) # 3D layout configurations and zones

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"))
    name = Column(String)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    status = Column(String) # scheduled, active, completed

class SensorData(Base):
    __tablename__ = "sensor_data"
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"))
    sensor_type = Column(String) # camera, lidar, ble
    zone = Column(String)
    value = Column(Float) # crowd density, wait time
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"))
    type = Column(String) # medical, security, congestion
    severity = Column(String) # low, medium, high, critical
    zone = Column(String)
    status = Column(String, default="open") # open, resolved
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
