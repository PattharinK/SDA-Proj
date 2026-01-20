from sqlalchemy import (
    Column,
    String,
    DateTime,
    func,
    BigInteger,
    Text,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Game(Base):
    __tablename__ = "games"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(255), nullable=True)
    player_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    game_id = Column(
        BigInteger, ForeignKey("games.id", ondelete="CASCADE"), nullable=False
    )
    last_played_at = Column(DateTime, server_default=func.now())


class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    game_id = Column(
        BigInteger, ForeignKey("games.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    best_score = Column(Integer, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
