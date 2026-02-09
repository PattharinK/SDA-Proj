# app/seed.py
import asyncio
from sqlalchemy import select  # เพิ่ม import select
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
                # 1. ดึงรายชื่อเกมทั้งหมดที่มีอยู่แล้วใน DB ออกมาก่อน
                result = await session.execute(select(Game.title))
                existing_titles = set(
                    result.scalars().all()
                )  # เก็บใส่ Set เพื่อให้เช็คได้เร็วๆ

                # 2. สร้าง list ของเกมใหม่ โดยเช็คว่า title ต้องไม่อยู่ใน existing_titles
                new_games_to_add = [
                    Game(**game_data)
                    for game_data in GAMES_SEED
                    if game_data["title"] not in existing_titles
                ]

                # 3. ถ้ามีเกมใหม่ ให้ทำการบันทึก
                if new_games_to_add:
                    session.add_all(new_games_to_add)
                    await session.commit()
                    print(
                        f"Seed games done successfully! Added {len(new_games_to_add)} new games."
                    )
                else:
                    print(
                        "Seed games checked: All games already exist. No new data added."
                    )

                break  # ทำงานสำเร็จแล้ว เบรคออกจาก loop

        except Exception as e:
            print(f"Database not ready yet: {e}")
            if i < max_retries - 1:
                print(f"Retrying in {retry_interval} seconds...")
                await asyncio.sleep(retry_interval)
            else:
                print("Max retries reached. Seeding failed.")
                raise e
        finally:
            # ปิด connection engine เมื่อจบการทำงานทั้งหมด
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_games())
