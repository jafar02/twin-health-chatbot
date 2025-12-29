import os
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")

if not OPENROUTER_KEY:
    raise ValueError("OPENROUTER_KEY is not set in .env")

# -----------------------------
# App setup
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "backend", "frontend", "build")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# -----------------------------
# OpenRouter Client
# -----------------------------
client = OpenAI(
    api_key=OPENROUTER_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# -----------------------------
# SYSTEM PROMPT (Strict Twin Health Scope)
# -----------------------------
SYSTEM_PROMPT = """
You are Twin Health AI, a specialized assistant for the Twin Health platform.

Twin Health focuses on metabolic health, twin studies, nutrition, lifestyle guidance, and precision health programs.

Rules:
1. You can ONLY answer questions related to Twin Health, metabolic health, twin studies, or health guidance for twins.
2. If the user asks anything outside this scope (e.g., recipes, jokes, unrelated topics), respond with:
   "Sorry, I can only answer questions about Twin Health."
3. Always provide clear, supportive, and safe guidance.
4. Do NOT provide medical diagnoses or prescriptions.
5. Encourage consulting healthcare professionals when needed.
"""

# -----------------------------
# Chat API
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
        )

        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

# -----------------------------
# Serve React Frontend
# -----------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if path and os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
