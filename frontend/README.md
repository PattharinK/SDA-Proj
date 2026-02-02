# SDA Game Platform – Real-time Leaderboard System

ระบบแพลตฟอร์มเกมพร้อม Leaderboard แบบ Real-time โดยใช้ WebSocket และ Redis(Pub/Sub)

---

## สารบัญ

1. ภาพรวมโครงการ
2. สิ่งที่ต้องมี
3. การตั้งค่าเบื้องต้น
4. การรันระบบ (Development Mode)
5. การเพิ่มข้อมูลเกมลงฐานข้อมูล
6. วิธีเพิ่มเกมใหม่
7. โครงสร้างโครงการ
8. API Endpoints
9. ระบบ Real-time Leaderboard
10. Troubleshooting
11. วิธีใช้งาน (มุมมองผู้ใช้)
12. เอกสารอ้างอิงเพิ่มเติม
13. Quick Start

---

## 1. ภาพรวมโครงการ

### วัตถุประสงค์

- ให้ผู้เล่นสามารถเล่นเกมผ่านเว็บได้
- บันทึกคะแนนของผู้เล่นลงฐานข้อมูล
- แสดง Leaderboard ที่อัปเดตแบบ Real-time โดยไม่ต้องรีเฟรชหน้าเว็บ

### สถาปัตยกรรมระบบ

```
Frontend (React + Vite)
    ↓ HTTP API / WebSocket
Backend (FastAPI)
    ↓
MySQL Database
    ↓
Redis (Pub/Sub)
    ↓
Frontend (Real-time Update)
```

### Feature หลัก

- ระบบ Authentication (Login / Register)
- รองรับหลายเกม (เช่น 2048, Flappy Bird)
- Leaderboard แบบ Real-time ผ่าน WebSocket
- Redis Pub/Sub สำหรับ Leaderboard
- การรันผ่าน Docker Compose

---

## 2. สิ่งที่ต้องมี

### Software ที่จำเป็น

- Docker และ Docker Compose
- Git
- Terminal หรือ Command Line

### พื้นที่จัดเก็บข้อมูล

- ต้องการพื้นที่ประมาณ 3–5 GB สำหรับ Docker images

---

## 3. การตั้งค่าเบื้องต้น

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd SDA-Proj
```

### Step 2: สร้างไฟล์ .env

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์

```ini
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=game_db
MYSQL_USER=gameuser
MYSQL_PASSWORD=gamepassword

DATABASE_URL=mysql+aiomysql://gameuser:gamepassword@mysql:3306/game_db
SECRET_KEY=change-this-secret-key

VITE_API_URL=http://localhost:8000
```

หมายเหตุ: ใน Production ควรตั้งค่า `SECRET_KEY` ใหม่

### Step 3: ตรวจสอบ Docker

```bash
docker --version
docker-compose --version
```

---

## 4. การรันระบบ (Development Mode)

### รันทั้งระบบ

```bash
docker-compose -f docker-compose.dev.yml up
```

Service ที่เปิดใช้งาน:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000/api](http://localhost:8000/api)
- MySQL: localhost:3307

ตรวจสอบ container:

```bash
docker ps
```

---

## 5. การเพิ่มข้อมูลเกมลงฐานข้อมูล

### แก้ไขไฟล์ Seed

ไฟล์: `backend/app/seeds/games_seed.py`

```python
GAMES = [
    {
        "title": "2048",
        "description": "Slide tiles",
        "icon_url": "/games/2048/game-icon.png",
    },
    {
        "title": "flappy",
        "description": "Avoid pipes",
        "icon_url": "/games/flappy/game-icon.png",
    },
]
```

ชื่อ `title` ต้องตรงกับชื่อโฟลเดอร์ใน `frontend/public/games/`

### รัน Seed

```bash
docker-compose -f docker-compose.dev.yml run --rm backend python -m app.seed
```

---

## 6. วิธีเพิ่มเกมใหม่

### Step 1: เพิ่มโฟลเดอร์เกมใน Frontend

```
frontend/public/games/snake/
```

### Step 2: เพิ่มข้อมูลใน games_seed.py

```python
{
    "title": "snake",
    "description": "Eat apples",
    "icon_url": "/games/snake/game-icon.png",
}
```

### Step 3: เชื่อม GameSDK

ในไฟล์ HTML

```html
<script src="/games/game-sdk.js"></script>
```

ใน JavaScript

```javascript
window.GameSDK.submitScore(finalScore);
```

### Step 4: รัน Seed ใหม่

```bash
docker-compose -f docker-compose.dev.yml run --rm backend python -m app.seed
```

---

## 7. โครงสร้างโครงการ

```
SDA-Proj/
├── backend/
├── frontend/
├── database/
├── nginx/
├── k6/
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── README.md
```

---

## 8. API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Games

```http
GET /api/games
GET /api/games/{game_id}
GET /api/games/by-title/{title}
POST /api/games/{game_id}/play
```

### Scores & Leaderboard

```http
POST /api/scores/submit
GET  /api/scores/leaderboard/{game_id}
GET  /api/scores/me/{game_id}
WS   /api/scores/ws/leaderboard/{game_id}
```

---

## 9. ระบบ Real-time Leaderboard

ลำดับการทำงาน:

1. Client ส่งคะแนนไปที่ Backend
2. Backend บันทึกคะแนนลง MySQL
3. Backend Publish event ไปที่ Redis
4. Client ที่ Subscribe ผ่าน WebSocket ได้รับข้อมูลทันที

---

## 10. Troubleshooting

### Docker ไม่ทำงาน

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up
```

### Leaderboard ไม่อัปเดต

- ตรวจสอบ Backend logs
- ตรวจสอบ WebSocket connection ใน Browser
- ตรวจสอบ Redis container

---

## 11. วิธีใช้งาน (มุมมองผู้ใช้)

1. Register และ Login
2. เลือกเกมจากหน้า Home
3. เล่นเกม
4. ดูคะแนนและ Leaderboard ที่อัปเดตแบบ Real-time

---

## 12. เอกสารอ้างอิงเพิ่มเติม

- FastAPI: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- React: [https://react.dev/](https://react.dev/)
- Redis: [https://redis.io/](https://redis.io/)
- Docker: [https://docs.docker.com/](https://docs.docker.com/)

API Docs:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 13. Quick Start

```bash
git clone <repository-url>
cd SDA-Proj

# สร้าง .env
# รันระบบ
docker-compose -f docker-compose.dev.yml up

# Seed database
docker-compose -f docker-compose.dev.yml run --rm backend python -m app.seed
```

Frontend: [http://localhost:5173](http://localhost:5173)
Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
