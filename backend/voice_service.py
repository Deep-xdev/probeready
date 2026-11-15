
from ai_service import client, MODEL


# --------------------------------------------------
# VOICE CONFIGURATION
# --------------------------------------------------

TRANSCRIPTION_MODEL = "whisper-large-v3-turbo"
TTS_MODEL = "canopylabs/orpheus-v1-english"
TTS_VOICE = "daniel"


# --------------------------------------------------
# SPEECH TO TEXT
# --------------------------------------------------

async def transcribe_audio(
    audio_bytes: bytes,
    filename: str
) -> str:

    if not audio_bytes:
        raise ValueError("Audio recording is empty.")

    transcription = await client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model=TRANSCRIPTION_MODEL,
        language="en",
        response_format="json",
        temperature=0
    )

    transcript = transcription.text.strip()

    if not transcript:
        raise ValueError("No speech detected in the recording.")

    return transcript


# --------------------------------------------------
# AI INTERVIEWER RESPONSE
# --------------------------------------------------

async def generate_interviewer_reply(
    transcript: str,
    original_question: str,
    resume_context: str = "",
    history: list = None
) -> str:

    if not transcript.strip():
        raise ValueError("Candidate response is empty.")

    messages = [
        {
            "role": "system",
            "content": """
You are ProbeReady, a professional technical interviewer.

You have THREE conversational modes.

MODE 1: INTERVIEW MODE (DEFAULT)
- Ask relevant technical questions.
- Understand and assess the candidate's answers.
- Challenge incorrect or incomplete statements.
- Probe technical depth and real understanding.
- Increase difficulty when the candidate demonstrates
  strong knowledge.
- Ask only ONE question at a time.
- Never repeat questions unnecessarily.

MODE 2: HINT MODE
- Activate when the candidate says they are stuck,
  asks for a hint, or says they don't know.
- Give a small, useful clue.
- Do not reveal the complete answer.
- Help the candidate think through the problem.
- Ask them to try answering again.

MODE 3: EXPLAIN MODE
- Activate when the candidate explicitly asks for an
  explanation, asks for the correct answer, or asks
  you to teach a concept.
- Explain the concept accurately and clearly.
- Use a short technical example when useful.
- Correct misconceptions directly.
- Do not keep asking interview questions when the
  candidate clearly wants an explanation.
- After explaining, ask whether they want to continue.

PROFESSIONAL DELIVERY:
- Sound calm, confident, composed, and professional.
- Use natural conversational English.
- Avoid slang and exaggerated excitement.
- Sound like an experienced technical interviewer,
  not a robotic assistant.
- Keep responses concise and suitable for voice playback.

IMPORTANT RULES:
- Understand the candidate's intent before responding.
- Never invent candidate experience.
- Never reveal internal evaluation scores.
- Keep every response under 180 characters.
- Ask only ONE question at a time.
"""
        }
    ]

    # Include recent conversation history.
    if history:
        for item in history[-10:]:

            role = item.get("role")
            content = item.get("content")

            if (
                role in ["user", "assistant"]
                and isinstance(content, str)
            ):
                messages.append({
                    "role": role,
                    "content": content[:3000]
                })

    # Add the latest candidate message.
    messages.append({
        "role": "user",
        "content": f"""
Original interview question:
{original_question}

Relevant resume context:
{resume_context}

Candidate's latest spoken message:
{transcript}

Choose the appropriate conversational mode
and respond accordingly.
"""
    })

    response = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.5,
        max_completion_tokens=150
    )

    reply = response.choices[0].message.content

    if not reply or not reply.strip():
        raise ValueError(
            "AI interviewer generated an empty response."
        )

    reply = reply.strip()

    # Keep within the Orpheus TTS input limit.
    if len(reply) > 180:
        reply = reply[:177].rsplit(" ", 1)[0] + "..."

    return reply


# --------------------------------------------------
# TEXT TO SPEECH
# --------------------------------------------------

async def generate_speech(text: str) -> bytes:

    if not text.strip():
        raise ValueError("Speech text is empty.")

    if len(text) > 200:
        raise ValueError(
            "Speech text exceeds the 200-character limit."
        )

    response = await client.audio.speech.create(
        model=TTS_MODEL,
        voice=TTS_VOICE,
        input=text,
        response_format="wav"
    )

    audio_bytes = await response.read()

    if not audio_bytes:
        raise ValueError("Audio generation failed.")

    return audio_bytes
