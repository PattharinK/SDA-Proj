from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.auth import router as auth_router
from app.api.scores import router as scores_router
from app.api.games import router as games_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# รวมทุก router เข้า api_router
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(games_router)
api_router.include_router(scores_router)

# include api_router เข้า app
app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "Game API"}


@app.get("/health")
async def health():
    import os, socket

    return {"hostname": socket.gethostname(), "pid": os.getpid()}
