from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Environment
    environment: str = "development"

    # Database Configuration
    database_url: str = "mysql+aiomysql://game_user:game_pass@mysql:3306/game_db"

    # Security Configuration
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Redis Configuration
    redis_url: str = "redis://sda_redis:6379"

    # Service URLs
    frontend_url: str = "http://localhost:5173"

    # CORS Configuration
    cors_origins: str = "http://localhost:5173"

    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
