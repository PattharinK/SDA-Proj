# SDA Game Platform

SDA Game Platform is a web-based gaming application built with a modern tech stack, featuring multiple integrated games, a leaderboard system, and user authentication.

##  Tech Stack

### Frontend
- **Library**: React Vite
- **Styling**: Nes.css (8-bit style)
- **State Management**: Zustand
- **Routing**: React Router 
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy (Async)
- **Authentication**: JWT (OAuth2 with Password Flow)
- **Server**: Uvicorn / Gunicorn

### Infrastructure
- **Database**: MySQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (Production)

##  Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

##  Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd SDA-Proj
   ```

2. **Environment Configuration**
   The project requires an `.env` file in the root directory. You can create one based on the provided configuration:
   
 
3. **Run with Docker Compose**
   Start the application in development mode:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build --scale backend=3
   ```

   To stop the application:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

##  Project Structure

- `backend/`: FastAPI application source code.
  - `app/`: Main application logic (API, models, schemas).
  - `requirements.txt`: Python dependencies.
  - `Dockerfile`: Backend container configuration.
- `frontend/`: React application source code.
  - `src/`: Components, pages, and styles.
  - `public/`: Static assets (including games like Flappy, 2048).
  - `package.json`: Frontend dependencies.
- `database/`: Database initialization scripts (`init.sql`).
- `nginx/`: Nginx configuration for production serving.
- `docker-compose.dev.yml`: Container orchestration for development.
- `docker-compose.prod.yml`: Container orchestration for production.

##  Access the Application

Once the containers are running, you can access:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Redis Commander**: [http://localhost:6379](http://localhost:6379)

##  Features

- **User Authentication**: Sign up, Login, Guest, Profile management.
- **Game Library**:
    - **Flappy Bird**: Classic flapping game.
    - **2048**: Tile merging puzzle.
    - **Sudoku**: Number puzzle.
    - **Slot Machine**: Slot machine game.
    - **Hextris**: Hexagonal puzzle game.

- **Leaderboard**: Global high scores and ranking.
- **Responsive Design**: Retro-themed UI with Nes.css.
