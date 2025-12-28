import os
from flask import Flask, request, jsonify
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
    raise ValueError("OPENROUTER_KEY is not set")

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# OpenRouter Client
# -----------------------------
client = OpenAI(
    api_key=OPENROUTER_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# -----------------------------
# Health Check / Home Page
# -----------------------------
@app.route("/")
def home():
    return "✅ Twin Health API is running successfully!"

# -----------------------------
# Chat Endpoint
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a Twin Health assistant. Answer only questions related to metabolic health, twins, or health guidance."
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
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
