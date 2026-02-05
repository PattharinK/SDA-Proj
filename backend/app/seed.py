# app/seed.py
import asyncio
from sqlalchemy.dialects.mysql import insert

from app.database import async_session, engine
from app.models import Game
from app.seeds.games_seed import GAMES_SEED



async def seed_games():
    max_retries = 10
    retry_interval = 2

    for i in range(max_retries):
        try:
            print(f"Attempting to seed database (Attempt {i+1}/{max_retries})...")
            async with async_session() as session:
                # ลอง Test Connection ก่อน
                await session.execute(insert(Game).values(GAMES_SEED).prefix_with("IGNORE"))
                await session.commit()
                print("Seed games done successfully!")
                break
        except Exception as e:
            print(f"Database not ready yet: {e}")
            if i < max_retries - 1:
                print(f"Retrying in {retry_interval} seconds...")
                await asyncio.sleep(retry_interval)
            else:
                print("Max retries reached. Seeding failed.")
                raise e
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_games())
