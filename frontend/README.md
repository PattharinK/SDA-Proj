# SDA Game Platform – Real-time Leaderboard System

ระบบแพลตฟอร์มเกมพร้อม Leaderboard แบบ Real-time โดยใช้ WebSocket และ Redis(Pub/Sub)

---

## สารบัญ

1. [ภาพรวมโครงการ](#ภาพรวมโครงการ)
2. [Feature หลัก](#feature-หลัก)
3. [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
4. [สิ่งที่ต้องมี](#สิ่งที่ต้องมี)
5. [การตั้งค่าเบื้องต้น](#การตั้งค่าเบื้องต้น)
6. [การรันระบบ (Development Mode)](#การรันระบบ-development-mode)
7. [การเพิ่มข้อมูลเกม (Seed Database)](#การเพิ่มข้อมูลเกม-seed-database)
8. [วิธีเพิ่มเกมใหม่](#วิธีเพิ่มเกมใหม่)
9. [โครงสร้างโครงการ](#โครงสร้างโครงการ)
10. [API Endpoints](#api-endpoints)
11. [ระบบ Real-time Leaderboard](#ระบบ-real-time-leaderboard)
12. [Makefile (คำสั่งลัด)](#makefile-คำสั่งลัด)
13. [Troubleshooting](#troubleshooting)
14. [Quick Start](#quick-start)
15. [เอกสารอ้างอิงเพิ่มเติม](#เอกสารอ้างอิงเพิ่มเติม)

---

## ภาพรวมโครงการ

### วัตถุประสงค์

- ให้ผู้เล่นสามารถเล่นเกมผ่าน Web Browser
- บันทึกคะแนนของผู้เล่นลงฐานข้อมูล
- แสดง Leaderboard ที่อัปเดตแบบ Real-time โดยไม่ต้องรีเฟรชหน้าเว็บ
- รองรับหลายเกม และเพิ่มเกมใหม่ได้ง่าย

---

## Feature หลัก

- Authentication (Register / Login / JWT)
- รองรับหลายเกม (เช่น 2048, Flappy Bird, Snake)
- Leaderboard แบบ Real-time ผ่าน WebSocket
- Redis Pub/Sub สำหรับกระจาย Event คะแนน
- รันระบบด้วย Docker Compose
- พร้อมสำหรับ Load Test (k6)

---

## สถาปัตยกรรมระบบ

```
Frontend (React + Vite)
    ↓ HTTP API / WebSocket
Backend (FastAPI)
    ↓
MySQL Database
    ↓
Redis (Pub/Sub)
    ↓
Frontend (Real-time Leaderboard Update)
```

---

## สิ่งที่ต้องมี

### Software Requirements

- Docker
- Docker Compose
- Git
- Terminal / Command Line

### Storage

- พื้นที่อย่างน้อย **3–5 GB** สำหรับ Docker images และ volumes

---

## การตั้งค่าเบื้องต้น

### 1️Clone Repository

```bash
git clone <repository-url>
cd SDA-Proj
```

### 2️สร้างไฟล์ `.env`

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

> **Production:** ต้องเปลี่ยน `SECRET_KEY` ให้ปลอดภัยเสมอ

### 3 ตรวจสอบ Docker

```bash
docker --version
docker-compose --version
```

---

## การรันระบบ (Development Mode)

### ▶รันทั้งระบบ

```bash
docker-compose -f docker-compose.dev.yml up
```

### Service URLs

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000/api](http://localhost:8000/api)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- MySQL: localhost:3307

ตรวจสอบ container ที่กำลังรัน:

```bash
docker ps
```

---

## การเพิ่มข้อมูลเกม (Seed Database)

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

> ℹค่า `title` ต้องตรงกับชื่อโฟลเดอร์ใน `frontend/public/games/`

### รัน Seed

```bash
docker-compose -f docker-compose.dev.yml run --rm backend python -m app.seed
```

---

## วิธีเพิ่มเกมใหม่

### Step 1: เพิ่มโฟลเดอร์เกม

```
frontend/public/games/snake/
```

### Step 2: เพิ่มข้อมูลเกมใน Seed

```python
{
    "title": "snake",
    "description": "Eat apples",
    "icon_url": "/games/snake/game-icon.png",
}
```

### Step 3: เชื่อม GameSDK

ในไฟล์ HTML ของเกม

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

## โครงสร้างโครงการ

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

## API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Games

```
GET /api/games
GET /api/games/{game_id}
GET /api/games/by-title/{title}
POST /api/games/{game_id}/play
```

### Scores & Leaderboard

```
POST /api/scores/submit
GET  /api/scores/leaderboard/{game_id}
GET  /api/scores/me/{game_id}
WS   /api/scores/ws/leaderboard/{game_id}
```

---

## ระบบ Real-time Leaderboard

### Flow การทำงาน

1. Client ส่งคะแนนไปที่ Backend
2. Backend บันทึกคะแนนลง MySQL
3. Backend Publish Event ไปที่ Redis
4. Client ที่ Subscribe ผ่าน WebSocket จะได้รับข้อมูลทันที

---

## Makefile (คำสั่งลัด)

### คำสั่งหลัก

| Command              | Description              |
| -------------------- | ------------------------ |
| make up              | เปิด services ทั้งหมด    |
| make down            | ปิด services ทั้งหมด     |
| make restart         | restart ทุก service      |
| make restart-backend | restart backend เท่านั้น |

### Database & Data

| Command    | Description               |
| ---------- | ------------------------- |
| make seed  | เพิ่มข้อมูลเกมลงฐานข้อมูล |
| make clean | ลบ containers และ volumes |
| make fresh | clean → up → seed         |

### Logs & Debug

| Command           | Description         |
| ----------------- | ------------------- |
| make logs         | ดู logs ทุก service |
| make logs-backend | ดู logs backend     |
| make logs-redis   | ดู logs redis       |
| make logs-mysql   | ดู logs mysql       |

---

## Troubleshooting

### Leaderboard ไม่อัปเดต

- ตรวจสอบ WebSocket connection ใน Browser DevTools
- ตรวจสอบ Redis container ยังทำงานอยู่หรือไม่
- ตรวจสอบ Backend logs (`make logs-backend`)

### Docker มีปัญหา

```bash
make down
make up
```

---

## Quick Start

```bash
git clone <repository-url>
cd SDA-Proj

# สร้าง .env
make up
make seed
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## เอกสารอ้างอิงเพิ่มเติม

- FastAPI: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- React: [https://react.dev/](https://react.dev/)
- Redis: [https://redis.io/](https://redis.io/)
- Docker: [https://docs.docker.com/](https://docs.docker.com/)
