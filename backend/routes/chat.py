from flask import Blueprint, request, jsonify
from groq import Groq
import os

chat_bp = Blueprint("chat", __name__)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are Pankh, a friendly AI assistant for NayePankh Foundation — a UP Government registered NGO 
that helps underprivileged people through food drives, clothes donation, education, and sanitary hygiene awareness.

You help volunteers understand:
- What NayePankh Foundation does
- How to register and get started as a volunteer
- What tasks and events are available
- How to earn a certificate (complete 5 tasks)
- How to contact NayePankh (email: contact@nayepankh.com, phone: +91 83185 00748)

Keep responses short, friendly, and encouraging. Always end with a motivating line.
If asked something outside NayePankh, politely redirect to NGO topics.
"""


@chat_bp.route("/", methods=["POST"])
def chat():
    data = request.get_json()
    messages = data.get("messages", [])

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages[-8:]

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=full_messages,
        max_tokens=300
    )

    reply = response.choices[0].message.content.strip()
    return jsonify({"reply": reply}), 200