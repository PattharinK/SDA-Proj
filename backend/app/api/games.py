from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, text
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Game
from app.auth import get_current_user
from app.models import Game, GameSession, User
from app.schemas import GameResponse
from app.core.rate_limit import rate_limit

import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/games", tags=["games"])


@router.get("/", response_model=list[GameResponse])
async def list_games(db: AsyncSession = Depends(get_db)):
    logger.info("Fetching all games")

    # และทิ้ง query cache
    await db.execute(text("SELECT 1"))  # Warm up connection

    db.expire_all()

    # Use with_for_update() หรือ populate_existing
    stmt = (
        select(Game)
        .order_by(Game.created_at.desc())
        .execution_options(populate_existing=True)
    )

    result = await db.execute(stmt)
    games = result.scalars().all()

    for game in games:
        logger.info(
            f"Game {game.id} ({game.title}): player_count = {game.player_count}"
        )

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

    logger.info(f"User {current_user.id} attempting to play game {game_id}")

    # CHECK ก่อน
    result = await db.execute(
        select(GameSession).where(
            GameSession.user_id == current_user.id,
            GameSession.game_id == game_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Query fresh data
        game = await db.get(Game, game_id, options=[])
        await db.refresh(game)
        logger.info(
            f"Game {game_id} already started for user {current_user.id}, player_count: {game.player_count}"
        )
        return {
            "message": "Game already started",
            "player_count": game.player_count,
        }

    # ดู player_count ก่อน update
    before_result = await db.execute(
        select(Game.player_count).where(Game.id == game_id)
    )
    before_count = before_result.scalar_one()
    logger.info(f"Game {game_id} player_count BEFORE: {before_count}")

    # เพิ่ม session
    db.add(GameSession(user_id=current_user.id, game_id=game_id))

    # Atomic increment
    await db.execute(
        update(Game)
        .where(Game.id == game_id)
        .values(player_count=Game.player_count + 1)
    )

    await db.commit()

    # Query ค่าใหม่หลัง commit
    game = await db.get(Game, game_id)
    await db.refresh(game)

    logger.info(
        f"Game {game_id} player_count AFTER: {game.player_count} (expected: {before_count + 1})"
    )
    logger.info(f"User {current_user.id} started game {game_id}")

    return {
        "message": "Game started",
        "player_count": game.player_count,
    }
