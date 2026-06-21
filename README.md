# LibraAI - Smart Library Management & AI Learning Assistant

LibraAI is a full-stack, AI-powered Smart Library Management and Coursework Learning Assistant platform. It combines modern web application architectures (Node.js/Express, React.js) with Generative AI (RAG), Computer Vision (Face Recognition), and Recommendation systems. It is structured as a final-year B.Tech project.

---

## 🌟 Key Features

1. **Role-Based dashboards**: Tailored interfaces for Admins, Librarians, and Students.
2. **AI Librarian chatbot**: Answers questions using local semantic search and OpenAI RAG over textbook segments.
3. **PDF Learning Assistant**: Generates structured study notes (Short, Long, Exam, Revision styles) and interactive MCQ practice tests.
4. **Live Seat reservations**: Dynamic seating allocation map for study wings and room bookings.
5. **Face Recognition attendance**: Scan simulator using face landmarks that webhook-syncs check-ins to the Express logs.
6. **Smart Search & Recommendations**: Semantic book matching and history-based suggestions.
7. **Digital Student ID card**: Scannable barcode markings, QR code profiles, and print capabilities.

---

## 🛠️ Tech Stack & Directory Structure

- **Frontend**: `React.js`, `Tailwind CSS`, `Lucide Icons`, `Chart.js` (Port `3000` / Docker `80`)
- **Backend API**: `Node.js`, `Express.js`, `Mongoose` (Port `5000`)
- **AI Microservice**: `Python FastAPI`, `FAISS`, `SentenceTransformers`, `OpenCV` (Port `8000`)
- **Database**: `MongoDB` (Port `27017`)

---

## 🚀 Getting Started (Local Development Setup)

Follow these steps to run the complete environment locally:

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (running locally on default port `27017`)

### Step 1: Database Seeding
Navigate to the `backend` directory, install dependencies, and run the seeding script:
```bash
cd backend
npm install
# Seed users, books, seats, and study rooms
npm run seed
```
**Seed Accounts Created:**
- **Admin**: `admin@libra.ai` | Password: `password123`
- **Librarian**: `librarian@libra.ai` | Password: `password123`
- **Student**: `student@libra.ai` | Password: `password123`

### Step 2: Start Express Backend
Create a `.env` file (based on `.env.example`) and start the dev server:
```bash
# In backend folder
npm run dev
```

### Step 3: Start AI Microservice (FastAPI)
Open a new terminal window, navigate to the `ai-service` directory, set up a virtual environment, and run Uvicorn:
```bash
cd ai-service
python -m venv venv
# Windows activate
venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Run FastAPI server
python app/main.py
```

### Step 4: Start React Frontend
Open a new terminal, navigate to the `frontend` folder, and start the development server:
```bash
cd frontend
npm install
npm start
```
Go to `http://localhost:3000` to interact with the SaaS dashboard!

---

## 🐳 Docker Deployment Setup

Alternatively, launch the multi-container stack instantly using Docker Compose:
```bash
# Build and run containers
docker-compose up --build
```
Ensure you pass your `OPENAI_API_KEY` in your shell if you want GPT-4 features enabled, otherwise, the system will fall back to local heuristic extraction modes.

---

## 📚 API Endpoints Summary

### Express REST API
- `POST /api/auth/register` - Create user
- `POST /api/auth/verify-email` - Validate email code
- `POST /api/auth/login` - Retrieve JWT session token
- `GET /api/books` - Retrieve catalog list with search/page filters
- `POST /api/borrow/issue` - Issuing textbook desk (Librarian)
- `POST /api/borrow/return` - Return check-in (Librarian)
- `POST /api/seats/reserve` - Book desk (Student)
- `POST /api/attendance/qr-checkin` - Entry check-in (Student scan)
- `POST /api/attendance/face-checkin` - Computer vision entry hook

### FastAPI endpoints
- `POST /ai/pdf/upload` - Index PDF text slices into FAISS
- `POST /ai/pdf/chat` - RAG contextual questionanswering
- `POST /ai/pdf/notes` - Study guide compiler (Short/Exam)
- `POST /ai/pdf/mcq` - MCQ test generator (JSON format)
- `POST /ai/face/register` - Face mesh landmark encoder
- `POST /ai/face/verify` - Face gate checker & webhook pipeline
