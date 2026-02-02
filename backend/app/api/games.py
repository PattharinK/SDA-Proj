from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Game
from app.auth import get_current_user
from app.models import Game, GameSession, User
from app.schemas import GameResponse
from app.core.rate_limit import rate_limit

router = APIRouter(prefix="/games", tags=["games"])


@router.get("/", response_model=list[GameResponse])
async def list_games(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Game).order_by(Game.created_at.desc()))
    games = result.scalars().all()
    return games


@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: AsyncSession = Depends(get_db)):
    game = await db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/by-title/{title}", response_model=GameResponse)
async def get_game_by_title(title: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Game).where(Game.title == title.replace("-", " ")))
    game = result.scalar_one_or_none()

    if not game:
        raise HTTPException(404, "Game not found")

    return game


@router.post("/{game_id}/play")
async def play_game(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await rate_limit(
        key=f"rate:play:{current_user.id}:{game_id}",
        limit=10,
        window=300,
    )
    # 1️ ตรวจเกม
    game = await db.get(Game, game_id)
    if not game:
        raise HTTPException(404, "Game not found")

    # 2️ ตรวจว่า user เคยเล่นเกมนี้ไหม
    result = await db.execute(
        select(GameSession).where(
            GameSession.user_id == current_user.id,
            GameSession.game_id == game_id,
        )
    )
    session = result.scalar_one_or_none()

    # 3️ ถ้ายังไม่เคย → เพิ่ม session + เพิ่ม player_count
    if not session:
        db.add(
            GameSession(
                user_id=current_user.id,
                game_id=game_id,
            )
        )
        game.player_count += 1
        await db.commit()

    return {
        "message": "Game started",
        "player_count": game.player_count,
    }
