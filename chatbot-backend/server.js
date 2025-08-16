import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { hiteshPersona } from "./personas/hitesh.js";
import { piyushPersona } from "./personas/piyush.js";
import rateLimitMiddleware from "./middlewares/rateLimit.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
});

// Store chat histories for different sessions
const chatHistories = new Map();

// Available mentors
const mentors = {
  hitesh: {
    name: "Hitesh Choudhary",
    persona: hiteshPersona,
  },
  piyush: {
    name: "Piyush Garg",
    persona: piyushPersona,
  },
};

app.post("/api/chat", rateLimitMiddleware, async (req, res) => {
  try {
    const { message, mentorId, sessionId } = req.body;

    if (!mentors[mentorId]) {
      return res.status(400).json({ error: "Invalid mentor ID" });
    }

    // Initialize or get existing chat history
    if (!chatHistories.has(sessionId)) {
      const initialHistory = [mentors[mentorId].persona];
      chatHistories.set(sessionId, initialHistory);
      chatHistories.set(`${sessionId}-created`, Date.now());
    }
    const chatHistory = chatHistories.get(sessionId);

    // Clean up old sessions (older than 72 hours)
    const cleanupTime = Date.now() - 72 * 60 * 60 * 1000;
    for (const [key, createdTime] of chatHistories) {
      if (key.endsWith("-created") && createdTime < cleanupTime) {
        chatHistories.delete(key.replace("-created", ""));
        chatHistories.delete(key);
      }
    }

    // Add user message
    chatHistory.push({ role: "user", content: message });

    // Get AI response
    const response = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: chatHistory,
    });

    // Remove formatResponse usage
let assistantResponse = response.choices[0].message.content;

// Clean minor spacing (optional)
assistantResponse = assistantResponse.replace(/\n{3,}/g, "\n\n").trim();

// Add assistant response to history
chatHistory.push({ role: "assistant", content: assistantResponse });

res.json({
  message: assistantResponse,
  mentor: mentors[mentorId].name,
});

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
