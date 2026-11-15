# ProbeReady

> An adaptive AI interview coach that tests what candidates actually claim.

ProbeReady is an AI-powered interview preparation platform that evaluates candidates based on their skills, resume claims, and technical understanding. Rather than relying on generic question banks, it analyzes a candidate's resume, generates personalized interview questions, and provides structured feedback to help identify knowledge gaps.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Future Development](#future-development)
- [Project Vision](#project-vision)
- [Developer](#developer)

## Features

- **Resume Intelligence:** Extracts skills, projects, education, experience, and technical claims from uploaded resumes.
- **AI Question Generation:** Creates personalized technical questions based on resume information.
- **Mock Interviews:** Provides an interactive environment for interview practice.
- **Answer Evaluation:** Evaluates responses for technical accuracy, depth, clarity, and supporting evidence.
- **Performance Analytics:** Displays interview scores, strengths, and areas for improvement.
- **Adaptive Interviewing:** Adjusts question difficulty based on candidate performance.

## Screenshots

_Add application screenshots here when available._

| Dashboard | Resume Intelligence |
| --- | --- |
| Add dashboard screenshot | Add resume screenshot |

| Mock Interview | Interview Report |
| --- | --- |
| Add interview screenshot | Add report screenshot |

## How It Works

1. Upload your resume.
2. ProbeReady extracts your skills, projects, and technical claims.
3. The AI generates personalized interview questions.
4. Participate in a mock interview.
5. Receive AI-powered feedback and evaluation.
6. Review your performance and identify areas for improvement.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI, REST API |
| Database | SQLite, SQLAlchemy |
| AI | Groq API, LLM integration |

## Project Structure

```text
probeready/
├── backend/
│   ├── main.py
│   ├── ai_service.py
│   ├── question_service.py
│   ├── adaptive_service.py
│   ├── evaluation_service.py
│   ├── voice_service.py
│   ├── database.py
│   └── models.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── pages/
└── README.md
```

## Getting Started

### Prerequisites

- Python
- Node.js and npm
- Git
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/Deep-xdev/probeready.git
cd probeready
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows**

```powershell
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your Groq credentials:

```dotenv
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

Start the backend from the `backend/` directory:

```bash
uvicorn main:app --reload
```

The API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Set up the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL provided by Vite.

## Future Development

- User authentication and individual candidate profiles.
- Secure, user-specific data management.
- Advanced voice-based interview experiences.
- GitHub repository analysis for technical claim verification.
- Improved adaptive interview workflows.
- Personalized learning recommendations.

## Project Vision

ProbeReady aims to make interview preparation more practical and evidence-driven by focusing on what candidates can actually explain and demonstrate, rather than what they can simply memorize.

## Developer

**Deep-xdev**

- [GitHub](https://github.com/Deep-xdev)
- [Repository](https://github.com/Deep-xdev/probeready)

---

Developed as an ongoing project focused on AI-powered interview preparation and career readiness.
