from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    WebSocket,
    WebSocketDisconnect,
    Request,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import logging


logger = logging.getLogger(__name__)
from app.core.redis import redis_client
from app.database import get_db
from app.auth import get_current_user, get_user_from_token
from app.models import Game, GameSession, Leaderboard, User
from app.schemas import SubmitScoreRequest
from app.core.rate_limit import rate_limit
import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/scores", tags=["scores"])

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
    await rate_limit(
        key=f"rate:score:{current_user.id}",
        limit=30,
        window=300,
    )

    validate_score(body.score)

    # 1 ตรวจ Game
    game = await db.get(Game, body.game_id)
    if not game:
        raise HTTPException(404, "Game not found")

    # 2️ ต้องเคยกด play ก่อนเท่านั้น
    result = await db.execute(
        select(GameSession).where(
            GameSession.user_id == current_user.id,
            GameSession.game_id == body.game_id,
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=400,
            detail="Game not started yet",
        )

    # 3️ Leaderboard
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
    await db.refresh(leaderboard)

    if score_changed:
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
    return {
        "message": "Score submitted (no change)",
        "best_score": leaderboard.best_score,
    }


@router.get("/leaderboard/{game_id}")
async def leaderboard(
    game_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else "unknown"
    await rate_limit(
        key=f"rate:leaderboard:{ip}",
        limit=60,
        window=60,
    )
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
        .execution_options(populate_existing=True)
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
    # ---------- Auth ----------
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    current_user = await get_user_from_token(token, db)
    if not current_user:
        await websocket.close(code=1008)
        return

    ip = websocket.client.host if websocket.client else "unknown"

    try:
        await rate_limit(
            key=f"rate:ws:{ip}:{current_user.id}:{game_id}",
            limit=5,
            window=60,
        )
    except HTTPException:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    logger.info(f" WS connected | game={game_id} user={current_user.id} ip={ip}")

    # ---------- Redis PubSub ----------
    pubsub = redis_client.pubsub()
    channel = f"leaderboard:{game_id}"
    await pubsub.subscribe(channel)
    logger.info(f" Subscribed: {channel}")

    try:
        # ---------- Send initial leaderboard ----------
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

        initial_data = []
        for row in result.all():
            m = row._mapping
            initial_data.append(
                {
                    "user_id": m[User.id],
                    "username": m[User.username],
                    "score": m[Leaderboard.best_score],
                }
            )

        await websocket.send_json({"type": "initial", "data": initial_data})

        # ---------- Listen Redis (non-blocking) ----------
        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=0.5,
            )

            if message and message["type"] == "message":
                score_data = json.loads(message["data"])
                await websocket.send_json({"type": "update", "data": score_data})

    except WebSocketDisconnect:
        logger.info(f"WS disconnected | game={game_id} user={current_user.id}")

    except Exception as e:
        logger.error(f"WS error | game={game_id} user={current_user.id} | {e}")
        await websocket.close(code=1011)

    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
        logger.info(f"PubSub closed | {channel}")
