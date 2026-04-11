from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: int

class UserResponse(UserBase):
    id: int
    created_at: datetime
    role_id: int

    class Config:
        from_attributes = True

class VenueBase(BaseModel):
    name: str
    location: str

class VenueResponse(VenueBase):
    id: int

    class Config:
        from_attributes = True

class SectionBase(BaseModel):
    name: str
    capacity: int

class SectionResponse(SectionBase):
    id: int
    venue_id: int

    class Config:
        from_attributes = True
