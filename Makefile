# =========================
# Docker Compose Advanced Makefile
# =========================

COMPOSE=docker compose
SERVICES=backend frontend nginx mysql

.DEFAULT_GOAL := help

# =========================
# Core (Fast)
# =========================

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=100


# =========================
# Build (Selective)
# =========================

build:
	$(COMPOSE) build

build-backend:
	$(COMPOSE) build backend

build-frontend:
	$(COMPOSE) build frontend

rebuild-backend:
	$(COMPOSE) up -d --no-deps --build backend

rebuild-frontend:
	$(COMPOSE) up -d --no-deps --build frontend


# =========================
# Fast Update (NO rebuild)
# =========================

up-backend:
	$(COMPOSE) up -d --no-deps backend

up-frontend:
	$(COMPOSE) up -d --no-deps frontend

up-nginx:
	$(COMPOSE) up -d --no-deps nginx


# =========================
# Restart (Ultra Fast)
# =========================

restart-backend:
	$(COMPOSE) restart backend

restart-frontend:
	$(COMPOSE) restart frontend

restart-nginx:
	$(COMPOSE) restart nginx

restart-db:
	$(COMPOSE) restart mysql


# =========================
# Logs (Service Scoped)
# =========================

backend-logs:
	$(COMPOSE) logs -f backend

frontend-logs:
	$(COMPOSE) logs -f frontend

nginx-logs:
	$(COMPOSE) logs -f nginx

db-logs:
	$(COMPOSE) logs -f mysql


# =========================
# Debug / Shell
# =========================

backend-shell:
	$(COMPOSE) exec backend bash

frontend-shell:
	$(COMPOSE) exec frontend sh

nginx-shell:
	$(COMPOSE) exec nginx sh

db-shell:
	$(COMPOSE) exec mysql mysql -u$$MYSQL_USER -p$$MYSQL_PASSWORD $$MYSQL_DATABASE


# =========================
# Utilities
# =========================

clean:
	$(COMPOSE) down -v --remove-orphans

reset:
	$(COMPOSE) down -v
	$(COMPOSE) up -d --build

help:
	@echo ""
	@echo "🚀 Fast Docker Compose Commands"
	@echo ""
	@echo "Core:"
	@echo "  make up                  Start all services"
	@echo "  make down                Stop all services"
	@echo "  make ps                  Service status"
	@echo ""
	@echo "Fast update (no rebuild):"
	@echo "  make up-backend"
	@echo "  make up-frontend"
	@echo ""
	@echo "Rebuild single service:"
	@echo "  make rebuild-backend"
	@echo "  make rebuild-frontend"
	@echo ""
	@echo "Restart:"
	@echo "  make restart-backend"
	@echo "  make restart-frontend"
	@echo ""
	@echo "Debug:"
	@echo "  make backend-shell"
	@echo "  make frontend-shell"
	@echo ""
