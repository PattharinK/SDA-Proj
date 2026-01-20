from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, TokenResponse, LoginRequest
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # เช็ค User ซ้ำ
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")

    # สร้าง User ใหม่
    user = User(
        username=user_data.username,
        password=get_password_hash(user_data.password),  # Hash ตรงนี้เลย
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. หา User จาก DB
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    # 2. เช็ค Password (เอา Logic มาแปะตรงนี้เลย ไม่ต้องสร้าง func แยก)
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. สร้าง Token
    access_token = create_access_token(data={"sub": user.username})
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}
