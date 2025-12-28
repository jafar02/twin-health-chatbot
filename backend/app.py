import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import traceback

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
OPENROUTER_KEY = os.environ.get("OPENROUTER_KEY")
if not OPENROUTER_KEY:
    raise ValueError("OPENROUTER_KEY is not set in .env")

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "build")

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

# -----------------------------
# OpenRouter Client
# -----------------------------
client = OpenAI(api_key=OPENROUTER_KEY, base_url="https://openrouter.ai/api/v1")

# -----------------------------
# Chat endpoint for Twin Health
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message missing"}), 400

        # Only answer Twin Health related queries
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",  # free tier model
            messages=[
                {"role": "system", "content": "You are a Twin Health assistant. Answer only questions about metabolic health, twin studies, or health guidance for twins."},
                {"role": "user", "content": data["message"]}
            ],
        )

        reply = (
            completion.choices[0].message.content
            if hasattr(completion, "choices") and completion.choices
            else "No reply from API"
        )

        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR in /chat:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to get response from API"}), 500

# -----------------------------
# Serve React frontend
# -----------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)


