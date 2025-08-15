import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { hiteshPersona } from './personas/hitesh.js';
import { piyushPersona } from './personas/piyush.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
    persona: hiteshPersona
  },
  piyush: {
    name: "Piyush Garg",
    persona: piyushPersona
  }
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, mentorId, sessionId } = req.body;

    if (!mentors[mentorId]) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    // Initialize or get existing chat history with persistent sessions
    if (!chatHistories.has(sessionId)) {
      // Initialize with the persona and store it with the guest token
      const initialHistory = [mentors[mentorId].persona];
      chatHistories.set(sessionId, initialHistory);
      
      // Store the session creation time
      chatHistories.set(`${sessionId}-created`, Date.now());
    }
    const chatHistory = chatHistories.get(sessionId);

    // Clean up old sessions (older than 72 hours)
    const cleanupTime = Date.now() - (72 * 60 * 60 * 1000);
    for (const [key, createdTime] of chatHistories) {
      if (key.endsWith('-created') && createdTime < cleanupTime) {
        chatHistories.delete(key.replace('-created', '')); // Delete chat history
        chatHistories.delete(key); // Delete timestamp
      }
    }

    // Add user message to history
    chatHistory.push({ role: "user", content: message });

    // Get AI response
    const response = await client.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: chatHistory,
    });

    let assistantResponse = response.choices[0].message.content;

    // Format the response for clean presentation
    const formatResponse = (text) => {
      // Convert links to clickable HTML elements with proper styling
      text = text.replace(
        /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
      );

      // Handle paragraphs - split by double newlines
      text = text.split('\n\n').map(paragraph => {
        // Skip if paragraph is empty
        if (!paragraph.trim()) return '';
        return `<p class="mb-4">${paragraph.trim()}</p>`;
      }).join('');

      // Handle single line breaks
      text = text.replace(/\n/g, '<br>');

      // Format lists if they exist (both bullet points and numbered)
      text = text.replace(/^(?:- |\* )(.*?)$/gm, '<li class="ml-4">$1</li>');
      text = text.replace(/^(\d+\. )(.*?)$/gm, '<li class="ml-4">$2</li>');

      // Wrap consecutive list items in ul/ol tags
      text = text.replace(/<li.*?>(.*?)<\/li>/g, '<ul class="list-disc mb-4">$&</ul>');

      // Clean up nested lists (remove extra ul tags)
      text = text.replace(/<\/ul><ul.*?>/g, '');

      return text;
    };

    assistantResponse = formatResponse(assistantResponse);

    // Add assistant response to history
    chatHistory.push({ role: "assistant", content: assistantResponse });

    // Send response
    res.json({
      message: assistantResponse,
      mentor: mentors[mentorId].name
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
