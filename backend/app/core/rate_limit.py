from fastapi import HTTPException, status, Request
from app.core.redis import redis_client

LUA_SCRIPT = """
    local current = redis.call("INCR", KEYS[1])
    if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
    end
    return current
    """


async def rate_limit(*, key: str, limit: int, window: int):
    try:
        count = await redis_client.eval(
            LUA_SCRIPT,
            1,
            key,
            window,
        )
    except Exception as e:
        # log ได้ แต่ปล่อยผ่าน
        print("Rate limit redis error:", e)
        return

    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests, slow down",
        )
