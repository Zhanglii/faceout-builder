require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const Tesseract = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract text from base64 image using Tesseract OCR
 * @param {string} base64Image - Data URL of the image (e.g., "data:image/png;base64,...")
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(base64Image) {
  try {
    console.log('Starting OCR extraction...');
    const worker = await Tesseract.createWorker();
    const result = await worker.recognize(base64Image);
    const extractedText = result.data.text;
    await worker.terminate();
    console.log(`OCR completed. Extracted ${extractedText.length} characters.`);
    return extractedText;
  } catch (err) {
    console.error('OCR error:', err);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Determine if the content is a base64 image
 * @param {string} content - Content to check
 * @returns {boolean} True if content is a base64 image
 */
function isBase64Image(content) {
  return content.startsWith('data:image/');
}

app.post('/api/analyze', async (req, res) => {
  try {
    let { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'no content' });
    }

    // If content is an image, extract text via OCR
    if (isBase64Image(content)) {
      console.log('Image detected. Running OCR...');
      content = await extractTextFromImage(content);
    }

    // Limit input to prevent rate limit errors
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '... (truncated)';
    }

    const prompt = `You are a product display analyzer. Analyze the snapshot and document ALL data/features displayed, focusing on WHAT information is shown and WHERE, not HOW it's technically built.

SNAPSHOT:
${content}

For each feature/data element you see, document:
- Feature name (what business data it represents)
- Data displayed (actual content/values shown)
- Position on screen
- Visual treatment (styling, hierarchy)
- Likely data source (API, database field, etc.)

## Product Display Features

List ALL visible features/data in the order they appear:

### [Feature Name]
- **Description**: What this feature shows
- **Data displayed**: Specific content/values (e.g., "4.5 stars from 2,341 reviews")
- **Position**: Location on screen
- **Visual styling**: Colors, fonts, size, spacing
- **Likely API/source**: Where this data would come from (e.g., Product API, Reviews API, Inventory API)
- **Required for implementation**: (Yes/No) Mark if essential for MVP

[Repeat for each feature]

## Data Dependencies Map
List all the different data sources/APIs this display needs to pull from:
- API/Data source name
- Which features use it
- Key fields needed

## Example features to look for:
- Product title, description, price
- Images, videos
- Star rating, review count
- Customer reviews/comments
- Availability status, inventory
- Badges, labels, promotions
- Navigation, filtering, sorting options
- Related products
- Add to cart, wishlist actions
- Specifications, details
- Delivery info, shipping estimates

Capture EVERY piece of data, so we can identify the backend APIs needed to feed this display.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const result = completion.choices[0].message?.content || '';
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'AI error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`AI server listening on ${port}`));
