import os
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.scores import router as scores_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(scores_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Game API"}


@app.get("/health")
async def health():
    import os, socket

    print("Handled by:", socket.gethostname(), "PID:", os.getpid())
    return {"hostname": socket.gethostname(), "pid": os.getpid()}
