# 🎮 SDA Game Platform - Makefile
# ================================
# Simple Docker Compose Commands
# ================================

.PHONY: help up down logs seed restart clean shell-backend shell-redis

help:
	@echo ""
	@echo "SDA Game Platform - Quick Commands"
	@echo "======================================"
	@echo ""
	@echo "⚡ Quick Start:"
	@echo "  make up              เปิด services ทั้งหมด (frontend, backend, mysql, redis)"
	@echo "  make down            ปิด services ทั้งหมด"
	@echo "  make seed            เพิ่มข้อมูลเกมลงฐานข้อมูล"
	@echo ""
	@echo "Debug & Logs:"
	@echo "  make logs            ดู logs ของทั้งหมด"
	@echo "  make logs-backend    ดู logs backend เท่านั้น"
	@echo "  make logs-redis      ดู logs redis"
	@echo "  make ps              ดู status ของ containers"
	@echo ""
	@echo "Restart:"
	@echo "  make restart         restart ทั้งหมด"
	@echo "  make restart-backend restart backend เท่านั้น"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           ลบ containers + volumes (⚠️ ตัดข้อมูล)"
	@echo ""
	@echo "Debug Shell:"
	@echo "  make shell-backend   เข้า bash ของ backend"
	@echo "  make shell-redis     เข้า redis-cli"
	@echo ""
	@echo "Workflow ทั่วไป:"
	@echo "  1. make up"
	@echo "  2. make seed"
	@echo "  3. ไปที่ http://localhost:5173"
	@echo ""

# ================================
# Core Commands (Docker Compose)
# ================================

up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Services started! Open: http://localhost:5173"

down:
	docker-compose -f docker-compose.dev.yml down
	@echo "Services stopped"

restart:
	docker-compose -f docker-compose.dev.yml restart
	@echo "Services restarted"

restart-backend:
	docker-compose -f docker-compose.dev.yml restart sda_backend
	@echo "Backend restarted"

# ================================
# Database & Data
# ================================

seed:
	docker-compose -f docker-compose.dev.yml run --rm sda_backend python -m app.seed
	@echo "Database seeded!"

clean:
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	@echo "Everything cleaned! (containers + volumes removed)"

# ================================
# Logs & Status
# ================================

logs:
	docker-compose -f docker-compose.dev.yml logs -f --tail=50

logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

logs-redis:
	docker-compose -f docker-compose.dev.yml logs -f redis

logs-mysql:
	docker-compose -f docker-compose.dev.yml logs -f mysql

ps:
	docker-compose -f docker-compose.dev.yml ps

# ================================
# Debug & Shell Access
# ================================

shell-backend:
	docker-compose -f docker-compose.dev.yml exec sda_backend /bin/bash
	@echo "Tip: type 'exit' to quit"

shell-redis:
	docker-compose -f docker-compose.dev.yml exec sda_redis redis-cli
	@echo "Tip: use 'SUBSCRIBE leaderboard:1' to watch real-time updates"

shell-mysql:
	docker-compose -f docker-compose.dev.yml exec sda_mysql mysql -uroot -p$(shell grep MYSQL_ROOT_PASSWORD .env | cut -d= -f2)

# ================================
# Status Check
# ================================

status:
	@echo "🔍 Checking services..."
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo ""

# ================================
# One-liner Combos
# ================================

fresh: clean up seed
	@echo "Fresh start complete!"

rebuild-backend:
	docker-compose -f docker-compose.dev.yml up -d --no-deps --build sda_backend
	@echo "Backend rebuilt"

rebuild-frontend:
	docker-compose -f docker-compose.dev.yml up -d --no-deps --build sda_frontend
	@echo "Frontend rebuilt"