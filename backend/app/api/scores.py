from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
import json
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

from app.database import get_db
from app.auth import get_current_user
from app.models import Game, GameSession, Leaderboard, User
from app.schemas import SubmitScoreRequest

router = APIRouter(prefix="/scores", tags=["scores"])

# Redis client
redis_client = None


async def get_redis():
    global redis_client
    if redis_client is None:
        redis_client = await redis.from_url("redis://redis:6379")  # Docker internal
    return redis_client


MAX_SCORE = 10000


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

    score_changed = False

    if not leaderboard:
        leaderboard = Leaderboard(
            user_id=current_user.id,
            game_id=body.game_id,
            best_score=body.score,
        )
        db.add(leaderboard)
        score_changed = True
    elif body.score > leaderboard.best_score:
        leaderboard.best_score = body.score
        score_changed = True

    await db.commit()

    if score_changed:
        redis_client = await get_redis()
        channel = f"leaderboard:{body.game_id}"
        score_data = {
            "user_id": current_user.id,
            "username": current_user.username,
            "score": leaderboard.best_score,
        }
        num_subscribers = await redis_client.publish(channel, json.dumps(score_data))
        logger.info(
            f"📢 Published to {channel}: {score_data} | Subscribers: {num_subscribers}"
        )

        return {
            "message": "Score submitted",
            "best_score": leaderboard.best_score,
        }


@router.get("/leaderboard/{game_id}")
async def leaderboard(game_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            User.id,
            User.username,
            Leaderboard.best_score,
        )
        .join(User, User.id == Leaderboard.user_id)
        .where(Leaderboard.game_id == game_id)
        .order_by(Leaderboard.best_score.desc())
        .limit(10)
    )

    data = []
    for row in result.all():
        m = row._mapping
        data.append(
            {
                "user_id": m[User.id],
                "username": m[User.username],
                "score": m[Leaderboard.best_score],
            }
        )

    return data


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


# WebSocket for Real-time
@router.websocket("/ws/leaderboard/{game_id}")
async def websocket_leaderboard(
    websocket: WebSocket,
    game_id: int,
    db: AsyncSession = Depends(get_db),
):
    await websocket.accept()
    logger.info(f"🔌 WebSocket connected for game {game_id}")
    redis = await get_redis()

    # Subscribe ไปยัง Redis channel
    pubsub = redis.pubsub()
    channel = f"leaderboard:{game_id}"
    await pubsub.subscribe(channel)
    logger.info(f"📻 Subscribed to channel: {channel}")

    try:
        result = await db.execute(
            select(
                User.id,
                User.username,
                Leaderboard.best_score,
            )
            .join(User, User.id == Leaderboard.user_id)
            .where(Leaderboard.game_id == game_id)
            .order_by(Leaderboard.best_score.desc())
            .limit(10)
        )
        current_data = []
        for row in result.all():
            m = row._mapping
            current_data.append(
                {
                    "user_id": m[User.id],
                    "username": m[User.username],
                    "score": m[Leaderboard.best_score],
                }
            )
        await websocket.send_json({"type": "initial", "data": current_data})

        # รอฟังข่าวจาก Redis
        async for message in pubsub.listen():
            if message["type"] == "message":
                score_data = json.loads(message["data"])
                await websocket.send_json({"type": "update", "data": score_data})

    except WebSocketDisconnect:
        await pubsub.unsubscribe(channel)
        logger.info(f" WebSocket disconnected from {channel}")
    except Exception as e:
        logger.error(f" WebSocket error on {channel}: {str(e)}")
        await pubsub.unsubscribe(channel)
