from openai import OpenAI
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()
HF_TOKEN = os.environ.get("HF_TOKEN")

if not HF_TOKEN:
    print("❌ HF_TOKEN is missing in .env")
    exit(1)

# Initialize Hugging Face client
client = OpenAI(api_key=HF_TOKEN, base_url="https://router.huggingface.co/v1")

# Test call
try:
    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2:novita",
        messages=[{"role": "user", "content": "Hello"}]
    )
    reply = completion.choices[0].message.content
    print("✅ Hugging Face token is valid! API reply:", reply)
except Exception as e:
    print("❌ Hugging Face token is invalid or expired:", e)
