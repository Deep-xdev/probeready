ProbeReady

An Adaptive AI Interview Coach That Tests What Candidates Actually Claim

ProbeReady is an AI-powered interview preparation platform designed to help candidates prepare for technical interviews through personalized questions, interactive mock interviews, and AI-driven answer evaluation.

Traditional interview preparation platforms often rely on generic question banks. ProbeReady takes a different approach by analyzing a candidate's resume, identifying their technical skills and project claims, and generating relevant interview questions to evaluate their actual understanding.

---

Overview

ProbeReady aims to make interview preparation more personalized, practical, and evidence-driven.

The platform helps candidates:

- Understand their technical strengths and weaknesses.
- Prepare for interviews using resume-based questions.
- Practice answering technical interview questions.
- Receive structured feedback on their responses.
- Track their interview performance.

Key Features

1. Resume Intelligence

Upload a resume and extract relevant information, including:

- Technical skills
- Projects
- Education
- Experience
- Technical claims

2. AI Question Generation

Generate personalized technical interview questions based on the candidate's resume and technical background.

3. Mock Interviews

Practice technical interviews through interactive interview sessions.

4. Answer Evaluation

Evaluate candidate responses using multiple criteria:

- Technical accuracy
- Depth of understanding
- Clarity
- Supporting evidence

5. Performance Analytics

Review interview performance, scores, strengths, weaknesses, and improvement areas.

6. Adaptive Interviewing

Adjust interview question difficulty based on candidate performance.

---

Technology Stack

Component| Technology
Frontend| React.js
Build Tool| Vite
Programming Language| JavaScript
Backend| Python
Backend Framework| FastAPI
Database| SQLite
ORM| SQLAlchemy
AI Integration| Groq API
Styling| CSS
Version Control| Git and GitHub

Project Structure

ProbeReady/
│
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

Installation and Setup

Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- Git
- A Groq API key

1. Clone the Repository

git clone https://github.com/Deep-xdev/probeready.git
cd probeready

2. Backend Setup

Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv venv

Activate the environment.

Windows:

venv\Scripts\activate

Linux/macOS:

source venv/bin/activate

Install the backend dependencies:

pip install -r requirements.txt

Create a ".env" file inside the backend directory:

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

Start the backend server:

uvicorn main:app --reload

The backend API documentation will be available at:

"http://localhost:8000/docs"

3. Frontend Setup

Open a separate terminal and navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Open the local URL provided by Vite in your browser.

---

How It Works

1. The candidate uploads their resume.
2. ProbeReady extracts relevant candidate information.
3. The AI generates personalized technical interview questions.
4. The candidate participates in a mock interview.
5. Responses are evaluated using structured evaluation criteria.
6. Performance results are saved and presented through the dashboard.

Future Improvements

The following improvements are planned for future development:

- User authentication and individual candidate profiles.
- User-specific resume and interview data isolation.
- Advanced adaptive interview workflows.
- Enhanced voice-based interview functionality.
- GitHub repository analysis for technical claim verification.
- Personalized learning recommendations.
- More detailed interview performance analytics.

Project Objective

ProbeReady aims to move beyond traditional interview preparation methods by evaluating what candidates actually understand rather than simply testing their ability to memorize answers.

The objective is to provide a practical interview preparation experience that helps candidates identify knowledge gaps, improve technical communication, and develop confidence through structured feedback.

Developer

Deep-xdev

GitHub: "https://github.com/Deep-xdev" (https://github.com/Deep-xdev)

Repository: "https://github.com/Deep-xdev/probeready" (https://github.com/Deep-xdev/probeready)

---

ProbeReady is an ongoing development project. Features and implementation details may evolve over time.
