// -----------------------------
// server.js
// -----------------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

// -----------------------------
// Load environment variables
// -----------------------------
dotenv.config();
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;
if (!OPENROUTER_KEY) throw new Error("OPENROUTER_KEY is not set in .env");

// -----------------------------
// App setup
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path to match your frontend build folder
const FRONTEND_DIR = path.join(__dirname, "frontend", "build");

// -----------------------------
// OpenRouter Client
// -----------------------------
const client = new OpenAI({
  apiKey: OPENROUTER_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// -----------------------------
// SYSTEM PROMPT
// -----------------------------
const SYSTEM_PROMPT = `
You are Twin Health AI, a friendly and helpful AI assistant for the Twin Health platform.

Main role:
- Provide clear, supportive guidance on Twin Health, metabolic health, twin studies, nutrition, lifestyle guidance, and precision health programs.

Safety Rules:
1. Always be transparent that you are an AI assistant.
2. Never provide medical diagnoses, personalized treatment advice, or prescriptions.
3. You can provide general educational information about health, nutrition, or lifestyle, but always clarify that it is **for informational purposes only**.
4. Respond politely and helpfully to general user questions like reports, scheduling, or workflows, but make it clear you are an AI (e.g., "As an AI assistant, I can help you review your report...").
5. For questions completely unrelated to Twin Health, respond politely, e.g., "I am here to help with Twin Health questions and guidance."
6. Encourage consulting licensed healthcare professionals for any personal medical concerns.
7. Keep your tone friendly, approachable, and professional.
`;

// -----------------------------
// Chat API
// -----------------------------
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------
// Serve React Frontend
// -----------------------------
app.use(express.static(FRONTEND_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// -----------------------------
// Run Server
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
