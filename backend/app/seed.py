# app/seed.py
import asyncio
from sqlalchemy.dialects.mysql import insert

from app.database import async_session, engine
from app.models import Game
from app.seeds.games_seed import GAMES_SEED


async def seed_games():
    async with async_session() as session:
        stmt = insert(Game).values(GAMES_SEED).prefix_with("IGNORE")

        await session.execute(stmt)
        await session.commit()

        print("Seed games done")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_games())
