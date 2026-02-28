# faceout-builder

This project is a starting point for building an AI agent in React (written in TypeScript) that reads product snapshots or mock files for the Faceout platform.

## Technologies

- **Frontend**: React 19 + TypeScript
- **Backend**: Express.js + OpenAI GPT-3.5-turbo
- **OCR**: Tesseract.js (optical character recognition)
- **Markdown**: react-markdown (for formatted output display)
- **Styling**: CSS with semantic HTML

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

The server code lives in `server.js`. It now **automatically extracts text from uploaded images using OCR (Tesseract)** before sending to OpenAI, so you can upload large images without hitting rate limits.

#### OCR Processing
- If you upload a PNG/JPG, the server runs Tesseract OCR to extract the visible text.
- The extracted text (instead of the raw base64 image) is sent to GPT-3.5-turbo for analysis.
- This dramatically reduces token usage and prevents rate-limit errors.

Modify the model, prompts, or input limits as needed for your use case.

## Features

### 1. **File Upload & Input**
- Accept text files (`.txt`, `.json`, `.md`)
- Accept image files (`.png`, `.jpg`, `.jpeg`)
- Manual text pasting in textarea
- *Styling*: Clean input controls with labels
- *A11y*: Proper `<label>` associations, keyboard navigable
- *UI*: File picker button, clear file type hints

### 2. **Image Preview**
- Display uploaded images before analysis
- Show preview with size constraints
- Clear indication that image is selected
- *Styling*: Responsive, max-width/height constraints
- *A11y*: Alt text for images
- *UI*: Thumbnail preview with visual feedback

### 3. **Content Input**
- Textarea for pasting snapshot text
- Disable when image is uploaded (no conflicting inputs)
- Expandable/resizable textarea
- *Styling*: Monospace font for code-like content
- *A11y*: Placeholder text, focus indicators
- *UI*: Clear visual state (active/disabled)

### 4. **OCR Processing**
- Auto-extract text from uploaded images using Tesseract.js
- Reduce token usage by ~100x vs raw base64
- Transparent to user (happens server-side)
- *Styling*: Show OCR status in loading message
- *A11y*: Provide feedback about OCR processing
- *UI*: Progress indicator during OCR

### 5. **AI Analysis**
- Send content to OpenAI GPT-3.5-turbo
- Structured prompt with clear format requests
- Return formatted analysis with sections
- *Styling*: Display results in code-block style
- *A11y*: Semantic HTML headings, clear sections
- *UI*: Organized output (headings, bullet points)

### 6. **Error Handling**
- Display user-friendly error messages
- Handle rate limits gracefully
- Show API errors without exposing internals
- *Styling*: Error styling (red text, icon)
- *A11y*: Announce errors clearly
- *UI*: Error banner with icon and message

### 7. **Loading State**
- Show spinner/message during analysis
- Disable analyze button while processing
- Estimate time for OCR + API calls
- *Styling*: Loading spinner animation
- *A11y*: Announce "Analyzing..." state
- *UI*: Visual feedback (spinner, elapsed time)

### 8. **Result Display**
- Show formatted analysis with proper text wrapping
- Scrollable container for long outputs
- Clear headings and sections
- *Styling*: Code block appearance, contrast
- *A11y*: Semantic structure (headings, lists)
- *UI*: Copy-to-clipboard button, expandable sections

- `src/App.tsx` - main application component orchestrating the workflow.
- `src/components/` - reusable UI components with single responsibility:
  - `FileUploadInput.tsx` - file upload input (text and image files).
  - `ImagePreview.tsx` - displays uploaded image preview.
  - `TextInput.tsx` - textarea for pasting snapshot text.
  - `AnalysisResult.tsx` - renders analysis results with loading and error states.
- `src/hooks/` - custom React hooks for state management:
  - `useFileUpload.ts` - manages file upload logic and state.
  - `useAnalysis.ts` - manages analysis state, loading, and error handling.
- `src/services/aiClient.ts` - service layer that calls the backend API.
- `server.js` - Express backend server that forwards requests to OpenAI GPT‑4.

Each component and hook follows the **single responsibility principle** for clarity and maintainability.
