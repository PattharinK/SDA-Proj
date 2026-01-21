from pydantic import BaseModel, Field
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):  # ข้อมูลพื้นฐานของ User
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):  # รับข้อมูลสมัคร
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):  # ส่งข้อมูล User
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):  # รับข้อมูลล็อกอิน
    username: str
    password: str


class TokenResponse(BaseModel):  # ส่ง Token
    access_token: str
    token_type: str = "bearer"


class SubmitScoreRequest(BaseModel):
    game_id: int
    score: int


class GameResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    player_count: int

    class Config:
        from_attributes = True
