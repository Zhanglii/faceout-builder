# faceout-builder

This project is a starting point for building an AI agent in React (written in TypeScript) that reads product snapshots or mock files for the Faceout platform.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the app and test the basic UI.

### Using the snapshot input

You can either paste the contents of a product snapshot/mock file directly into the textarea or upload a file. Supported types now include text files (`.txt`, `.json`, `.md`) **and images** (`.png`, `.jpg`, `.jpeg`).

- Text uploads will fill the textarea.
- Image uploads will display a preview above the textarea and disable it (since there's no textual content to edit).

The uploaded content (text or base64 image data) is passed to the AI service for analysis; clicking **Analyze** sends whichever content is present (image data takes precedence over text). By default the app now communicates with a small backend server that forwards the request to OpenAI’s GPT‑4 model.

### OpenAI setup

1. Create a `.env` file in the project root with:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```
2. Install server dependencies (already included): `express`, `openai`, `cors`, `dotenv`.
3. Run the backend with:
   ```bash
   npm run server
   ```
   This starts an API on port 3001. The React dev server proxies `/api` calls to it automatically.
4. Start the frontend in another terminal (`npm start`) and use the UI as before.

The server code lives in `server.js`; modify it if you want to change prompts or use a different model.

## Project Structure

- `src/App.tsx` - main component with textarea, file/image upload and analysis button.
- `src/services/aiClient.ts` - frontend helper that calls the backend API.
- `server.js` - simple Express server that invokes OpenAI GPT‑4.

Extend the service with real AI calls (OpenAI, local model, etc.) and expand the UI as needed.
