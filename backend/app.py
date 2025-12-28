import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()

OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")
if not OPENROUTER_KEY:
    raise RuntimeError("OPENROUTER_KEY is missing")

# -----------------------------
# App setup
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "build")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)

client = OpenAI(
    api_key=OPENROUTER_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# -----------------------------
# Health check / Home route
# -----------------------------
@app.route("/")
def home():
    return "✅ Twin Health API is running successfully!"

# -----------------------------
# Chat API
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Message field missing"}), 400

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a Twin Health assistant. Answer only health-related questions."
                },
                {
                    "role": "user",
                    "content": data["message"]
                }
            ]
        )

        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Internal server error"}), 500

# -----------------------------
# Serve React frontend (optional)
# -----------------------------
@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

# -----------------------------
# Start server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
