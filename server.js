import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Encryption Utilities for Stateless Session Cookie (AES-256-GCM)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
// Use fallback for dev environment, but enforce secure secret in production
const ENCRYPTION_SECRET = process.env.SESSION_SECRET || 'a_very_secure_fallback_secret_32_bytes_long_for_dev_mode!';

function encrypt(text, secret) {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${tag}`;
}

function decrypt(encryptedText, secret) {
  const key = crypto.createHash('sha256').update(secret).digest();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted session format');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const tag = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Google OAuth Client helper
function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  );
}

// OAuth URL generation
app.get('/api/auth/google/url', (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent'
    });
    res.json({ url });
  } catch (error) {
    console.error('Failed to generate OAuth URL:', error);
    res.status(500).json({ error: 'Authentication configuration mismatch' });
  }
});

// OAuth Callback handling
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }
  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    oauth2Client.setCredentials(tokens);
    const oauth2Obj = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2Obj.userinfo.get();
    
    const sessionData = {
      tokens,
      user: {
        name: userInfo.data.name || 'Eco User',
        picture: userInfo.data.picture || ''
      }
    };
    
    const encryptedSession = encrypt(JSON.stringify(sessionData), ENCRYPTION_SECRET);
    
    res.cookie('eco_session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.redirect('/');
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  const ecoSession = req.cookies.eco_session;
  if (!ecoSession) {
    return res.json({ authenticated: false });
  }
  try {
    const decrypted = decrypt(ecoSession, ENCRYPTION_SECRET);
    const sessionData = JSON.parse(decrypted);
    res.json({
      authenticated: true,
      user: sessionData.user
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('eco_session');
  res.json({ success: true });
});

// Google Calendar sync challenge
app.post('/api/calendar/sync', async (req, res) => {
  const ecoSession = req.cookies.eco_session;
  if (!ecoSession) {
    return res.status(401).json({ error: 'Unauthorized. Please authenticate with Google.' });
  }
  
  let sessionData;
  try {
    const decrypted = decrypt(ecoSession, ENCRYPTION_SECRET);
    sessionData = JSON.parse(decrypted);
  } catch (error) {
    return res.status(401).json({ error: 'Session has expired or is invalid.' });
  }
  
  const { challengeTitle, description, days, durationWeeks } = req.body;
  if (!challengeTitle || !days || !Array.isArray(days)) {
    return res.status(400).json({ error: 'Required sync fields are missing.' });
  }
  
  try {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(sessionData.tokens);
    
    // Auto-update encrypted cookie if fresh tokens are issued
    oauth2Client.on('tokens', (newTokens) => {
      sessionData.tokens = { ...sessionData.tokens, ...newTokens };
      const newEncrypted = encrypt(JSON.stringify(sessionData), ENCRYPTION_SECRET);
      res.cookie('eco_session', newEncrypted, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });
    });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const weekdayMap = {
      'Sunday': 'SU', 'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE',
      'Thursday': 'TH', 'Friday': 'FR', 'Saturday': 'SA'
    };
    
    const googleDays = days.map(d => weekdayMap[d]).filter(Boolean);
    if (googleDays.length === 0) {
      return res.status(400).json({ error: 'No valid weekdays provided.' });
    }
    
    const startEvent = new Date();
    startEvent.setHours(8, 0, 0, 0); // Scheduled for 8:00 AM local
    
    const totalEventsCount = (durationWeeks || 4) * googleDays.length;
    const recurrenceRule = `RRULE:FREQ=WEEKLY;BYDAY=${googleDays.join(',')};COUNT=${totalEventsCount}`;
    
    const event = {
      summary: `EcoTrace: ${challengeTitle}`,
      description: `${description}\n\nScheduled automatically via EcoTrace Carbon Platform.`,
      start: {
        dateTime: startEvent.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(startEvent.getTime() + 30 * 60 * 1000).toISOString(), // 30 min block
        timeZone: 'UTC',
      },
      recurrence: [recurrenceRule],
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 15 }],
      },
      colorId: '2', // Green ID in standard calendar
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    res.json({ success: true, htmlLink: response.data.htmlLink });
  } catch (error) {
    console.error('Google Calendar Sync Error:', error);
    res.status(500).json({ error: 'Failed to write event sequence to Google Calendar.' });
  }
});

// Gemini AI carbon coaching insights
app.post('/api/ai/coach', async (req, res) => {
  const { history, currentCalculation } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key is not configured.' });
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const promptText = `
      You are the EcoTrace AI Carbon Coach, a world-class sustainability expert.
      Analyze the following carbon footprint profile:
      - Current Footprint Data: ${JSON.stringify(currentCalculation)}
      - Historic Logs: ${JSON.stringify(history)}
      
      Provide a professional, structured carbon analysis.
      Follow these constraints:
      1. Do NOT use emojis.
      2. Do NOT use markdown tables or headings higher than H3.
      3. Be highly specific. If transport emissions are high, suggest specific modal shifts or vehicle adjustments. If housing emissions are high, target electricity, heating, or insulation.
      4. Focus on cost savings in parallel to carbon savings.
      
      Structure your response in three parts:
      ### Footprint Assessment
      Summarize where they stand compared to the global average (4.7 tons) and target (< 2.0 tons). Detail their main driver category.
      
      ### Personalized Action Steps
      Detail 3 concrete actions they can adopt. Each action should include the estimated annual CO2 reduction and monetary savings.
      
      ### Recommended Calendar Challenges
      Suggest 2 specific habits (e.g. "Meatless Mondays" or "Carpool Wednesdays") that they should schedule to build long-term sustainability.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
    });
    
    res.json({ advice: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with carbon coach API.' });
  }
});

// Serve frontend assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API Server is running in development mode.');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
