from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.auth import get_current_user
from app.models import Game, GameSession, Leaderboard, User
from app.schemas import SubmitScoreRequest

router = APIRouter(prefix="/scores", tags=["scores"])

MAX_SCORE = 500


# Helpers
def validate_score(score: int):
    if score < 0 or score > MAX_SCORE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid score",
        )


# Submit Score
@router.post("/submit")
async def submit_score(
    body: SubmitScoreRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_score(body.score)

    # ตรวจ Game
    game: Game | None = await db.get(Game, body.game_id)
    if not game:
        raise HTTPException(404, "Game not found")

    # ตรวจ session (user เล่นเกมนี้ครั้งแรก?)
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

    # Leaderboard (เก็บ best score)
    result = await db.execute(
        select(Leaderboard).where(
            Leaderboard.user_id == current_user.id,
            Leaderboard.game_id == body.game_id,
        )
    )
    leaderboard = result.scalar_one_or_none()

    if not leaderboard:
        db.add(
            Leaderboard(
                user_id=current_user.id,
                game_id=body.game_id,
                best_score=body.score,
            )
        )
    elif body.score > leaderboard.best_score:
        leaderboard.best_score = body.score

    await db.commit()

    return {
        "message": "Score submitted",
        "best_score": max(
            body.score, leaderboard.best_score if leaderboard else body.score
        ),
    }


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
