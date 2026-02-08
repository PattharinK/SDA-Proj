from socket import socket
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.auth import router as auth_router
from app.api.scores import router as scores_router
from app.api.games import router as games_router
from app.init_db import init_db
from app.config import settings
import os, socket

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(title="SDA Game Platform API", version="1.0.0")

# CORS Configuration from environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
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
    return {"hostname": socket.gethostname(), "pid": os.getpid()}


@app.get("/api/debug/load-balancer")
async def check_worker():
    # ดึงค่ามาเก็บไว้ก่อนเพื่อใช้ทั้งใน print และ return
    pid = os.getpid()
    container = socket.gethostname()

    # ส่วนที่เพิ่มเพื่อ Log ให้อ่านง่าย
    print("\n" + "-" * 50)
    print(f"  Request handled by Backend Node")
    print(f"    • Container ID : {container}")
    print(f"    • Worker PID   : {pid}")
    print("-" * 50 + "\n")

    return {
        "message": "Hello from Backend!",
        "worker_pid": pid,
        "container_id": container,
    }
