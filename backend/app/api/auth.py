from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User, Game, Leaderboard
from app.schemas import UserCreate, UserResponse, TokenResponse, LoginRequest
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.rate_limit import rate_limit

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
        password=get_password_hash(user_data.password),  # Hash
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host
    key = f"rate:login:{body.username}:{ip}"

    await rate_limit(
        key=key,
        limit=5,
        window=300,
    )
    # 1. หา User จาก DB
    result = await db.execute(select(User).where(User.username == body.username))
    user = result.scalar_one_or_none()

    # 2. เช็ค Password
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


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user profile with all game scores
    Returns: user info, created_at, and list of games played with scores
    """
    # Get all leaderboard entries for this user with game info
    result = await db.execute(
        select(
            Leaderboard.best_score,
            Game.id,
            Game.title,
            Game.thumbnail_url,
        )
        .join(Game, Game.id == Leaderboard.game_id)
        .where(Leaderboard.user_id == current_user.id)
        .order_by(Leaderboard.best_score.desc())
    )
    
    games = []
    for row in result.all():
        m = row._mapping
        games.append({
            "game_id": m[Game.id],
            "game_title": m[Game.title],
            "best_score": m[Leaderboard.best_score],
            "thumbnail_url": m[Game.thumbnail_url],
        })
    
    return {
        "username": current_user.username,
        "created_at": current_user.created_at.isoformat(),
        "games": games,
    }
