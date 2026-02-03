from sqlalchemy import select
from app.database import async_session
from app.models import Game
from app.seeds.games_seed import GAMES_SEED
import asyncio


async def init_db():
    for attempt in range(10):
        try:
            async with async_session() as db:
                result = await db.execute(select(Game.title))
                existing_titles = {row[0] for row in result.all()}

                new_games = [
                    Game(**game)
                    for game in GAMES_SEED
                    if game["title"] not in existing_titles
                ]

                if new_games:
                    db.add_all(new_games)
                    await db.commit()
                    print(f"Seeded {len(new_games)} games")
                else:
                    print("No new games to seed")

            print("Database ready")
            return

        except Exception as e:
            print(f"Database not ready (attempt {attempt+1}/10): {e}")
            await asyncio.sleep(2)

    raise RuntimeError("Database not ready after retries")
