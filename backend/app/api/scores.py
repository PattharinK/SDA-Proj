from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user
from app.models import Game, GameSession, Leaderboard, User

router = APIRouter(prefix="/scores", tags=["scores"])


# Schemas
class SubmitScoreRequest(BaseModel):
    game_id: int
    score: int


# Submit Score
@router.post("/submit")
async def submit_score(
    body: SubmitScoreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.score < 0 or body.score > 1000:
        raise HTTPException(400, "Invalid score")

    # 1️⃣ ตรวจ Game
    game = await db.get(Game, body.game_id)
    if not game:
        raise HTTPException(404, "Game not found")

    # 2️⃣ Game Session (นับผู้เล่นไม่ซ้ำ)
    result = await db.execute(
        select(GameSession).where(
            GameSession.user_id == current_user.id,
            GameSession.game_id == body.game_id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        db.add(
            GameSession(
                user_id=current_user.id,
                game_id=body.game_id,
            )
        )
        game.player_count += 1

    # 3️⃣ Leaderboard (best score)
    result = await db.execute(
        select(Leaderboard).where(
            Leaderboard.user_id == current_user.id,
            Leaderboard.game_id == body.game_id,
        )
    )
    lb = result.scalar_one_or_none()

    if not lb:
        db.add(
            Leaderboard(
                user_id=current_user.id,
                game_id=body.game_id,
                best_score=body.score,
            )
        )
    elif body.score > lb.best_score:
        lb.best_score = body.score

    await db.commit()
    return {"message": "Score submitted"}


# Leaderboard
@router.get("/leaderboard/{game_id}")
async def leaderboard(game_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            User.username,
            Leaderboard.best_score,
        )
        .join(User, User.id == Leaderboard.user_id)
        .where(Leaderboard.game_id == game_id)
        .order_by(Leaderboard.best_score.desc())
        .limit(10)
    )

    return [{"username": row.username, "score": row.best_score} for row in result.all()]


# My Best Score
@router.get("/me/{game_id}")
async def my_best_score(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Leaderboard).where(
            Leaderboard.user_id == current_user.id,
            Leaderboard.game_id == game_id,
        )
    )
    lb = result.scalar_one_or_none()
    return {"best_score": lb.best_score if lb else 0}
