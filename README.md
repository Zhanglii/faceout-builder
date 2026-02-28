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

You can either paste the contents of a product snapshot/mock file directly into the textarea or upload a text-based file (e.g. `.txt`, `.json`, `.md`) using the **Upload snapshot file** control. The uploaded file's text will populate the textarea automatically.

## Project Structure

- `src/App.js` - main component with a textarea for pasting snapshots and a button to trigger analysis.
- `src/services/aiClient.js` - placeholder for AI integration; currently returns mock responses.

Extend the service with real AI calls (OpenAI, local model, etc.) and expand the UI as needed.
