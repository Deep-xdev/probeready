ProbeReady

An Adaptive AI Interview Coach That Tests What Candidates Actually Claim.

ProbeReady is an AI-powered interview preparation platform that evaluates candidates based on their actual skills, resume claims, and technical understanding.

Instead of relying on generic question banks, ProbeReady analyzes a candidate's resume, generates personalized interview questions, and provides structured feedback to help identify knowledge gaps.

---

Screenshots

<!-- Add your application screenshots here -->Dashboard| Resume Intelligence
Add dashboard screenshot| Add resume screenshot

Mock Interview| Interview Report
Add interview screenshot| Add report screenshot

---

Features

- Resume Intelligence: Extracts skills, projects, education, experience, and technical claims from uploaded resumes.
- AI Question Generation: Generates personalized technical questions based on resume information.
- Mock Interviews: Provides an interactive environment for interview practice.
- Answer Evaluation: Evaluates responses based on technical accuracy, depth, clarity, and evidence.
- Performance Analytics: Displays interview scores, strengths, and areas for improvement.
- Adaptive Interviewing: Adjusts question difficulty based on candidate performance.

---

Technology Stack

Frontend| Backend| Database| AI
React.js| Python| SQLite| Groq API
Vite| FastAPI| SQLAlchemy| LLM Integration
JavaScript| REST API| | 

---

How It Works

1. Upload your resume.
2. ProbeReady extracts your skills, projects, and technical claims.
3. AI generates personalized interview questions.
4. Participate in a mock interview.
5. Receive AI-powered feedback and evaluation.
6. Review your performance and identify areas for improvement.

---

Project Structure

ProbeReady/
├── backend/
│   ├── main.py
│   ├── ai_service.py
│   ├── question_service.py
│   ├── adaptive_service.py
│   ├── evaluation_service.py
│   ├── voice_service.py
│   ├── database.py
│   └── models.py
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── pages/
│
└── README.md

---

Getting Started

Prerequisites

- Python
- Node.js and npm
- Git
- Groq API key

1. Clone the Repository

git clone https://github.com/Deep-xdev/probeready.git
cd probeready

2. Set Up the Backend

cd backend
python -m venv venv

Activate the virtual environment.

Windows

venv\Scripts\activate

Linux / macOS

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Create a ".env" file inside "backend/":

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

Run the backend:

uvicorn main:app --reload

API documentation: "http://localhost:8000/docs"

3. Set Up the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Open the local development URL provided by Vite.

---

Future Development

- User authentication and individual candidate profiles.
- Secure user-specific data management.
- Advanced voice-based interview experiences.
- GitHub repository analysis for technical claim verification.
- Improved adaptive interview workflows.
- Personalized learning recommendations.

---

Project Vision

ProbeReady aims to make interview preparation more practical and evidence-driven by focusing on what candidates can actually explain and demonstrate, rather than what they can simply memorize.

---

Developer

Deep-xdev

- GitHub: https://github.com/Deep-xdev
- Repository: https://github.com/Deep-xdev/probeready

---

Developed as an ongoing project focused on AI-powered interview preparation and career readiness.
