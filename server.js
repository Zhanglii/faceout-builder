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

const TEXT_MODEL = process.env.TEXT_MODEL || 'gpt-4.1-mini';
const VISION_MODEL = process.env.VISION_MODEL || 'gpt-4.1-mini';
const OCR_MODEL = process.env.OCR_MODEL || 'gpt-4.1-mini';
const USE_TESSERACT_OCR = process.env.USE_TESSERACT_OCR === 'true';

/**
 * Extract text from base64 image using Tesseract OCR
 * @param {string} base64Image - Data URL of the image (e.g., "data:image/png;base64,...")
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(base64Image) {
  try {
    console.log('Starting OCR extraction...');
    const result = await Tesseract.recognize(base64Image, 'eng');
    const extractedText = result.data.text || '';
    const confidence = Number(result.data.confidence || 0);
    const lines = (result.data.lines || [])
      .map((line) => ({
        text: (line.text || '').trim(),
        confidence: Number(line.confidence || 0),
        bbox: line.bbox || null,
      }))
      .filter((line) => line.text.length > 0);
    console.log(`OCR completed. Extracted ${extractedText.length} characters.`);
    return {
      text: extractedText,
      confidence,
      lines,
    };
  } catch (err) {
    console.error('OCR error:', err);
    return {
      text: '',
      confidence: 0,
      lines: [],
      error: 'OCR failed',
    };
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

function extractOcrSignals(ocrText) {
  const lines = ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLongLine = lines.find((line) => /[A-Za-z]/.test(line) && line.length >= 8) || '';
  const priceMatch = ocrText.match(/(?:\$|USD\s?)\s?\d{1,4}(?:[\.,]\d{2})?/i);
  const ratingMatch = ocrText.match(/(\d(?:\.\d)?)\s*(?:out of 5|stars?)/i);
  const reviewMatch = ocrText.match(/([\d,]{1,12})\s*(?:reviews?|ratings?)/i);

  return {
    title: firstLongLine || '',
    price: priceMatch ? priceMatch[0].replace(/\s+/g, ' ').trim() : '',
    rating: ratingMatch ? ratingMatch[1] : '',
    reviewCount: reviewMatch ? reviewMatch[1].replace(/,/g, '') : '',
  };
}

function safeJsonParse(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
    if (!fencedMatch?.[1]) return null;
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      return null;
    }
  }
}

async function runVisionAnalysis(base64Image) {
  const prompt = `Analyze this ENTIRE product snapshot from TOP TO BOTTOM and return STRICT JSON only.

CRITICAL: Scan the FULL image including top, middle, and BOTTOM sections. Pay special attention to:
- Action buttons (Add to Cart, Buy Now, Wishlist, etc.) typically at the BOTTOM
- All interactive elements and CTAs
- Complete UI hierarchy from top to bottom

Schema:
{
  "title": string,
  "price": string,
  "rating": string,
  "reviewCount": string,
  "primaryImagePresent": boolean,
  "visualAssets": [
    {"type": "star-icon|badge|logo|product-image|button|icon|other", "label": string, "position": string, "confidence": number}
  ],
  "features": [
    {
      "name": string,
      "description": string,
      "dataDisplayed": string,
      "position": string,
      "visualStyling": string,
      "likelySource": string,
      "requiredForImplementation": "Yes" | "No",
      "confidence": number,
      "dataType": "text|image|rating|price|action|link|other"
    }
  ],
  "apiDependencies": [
    {"name": string, "fields": string[]}
  ]
}

Rules:
- SCAN THE ENTIRE IMAGE including bottom sections where action buttons typically appear
- Extract ALL UI elements: text, images, icons, badges, stars, logos, product photos, AND BUTTONS
- For buttons/CTAs: set dataType="action", include button text in dataDisplayed, describe purpose
- For each feature, specify its position (top/middle/bottom/left/right)
- Prefer exact visible values where possible
- Confidence range is 0-100
- Return JSON only`;

  const completion = await openai.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64Image } },
        ],
      },
    ],
    max_tokens: 1800,
    temperature: 0.2,
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  const parsed = safeJsonParse(raw);
  if (!parsed) {
    throw new Error('Vision model did not return valid JSON');
  }
  return parsed;
}

async function runVisionOcrAnalysis(base64Image) {
  const prompt = `Extract textual content from this product screenshot and return STRICT JSON only.

Schema:
{
  "rawText": string,
  "title": string,
  "price": string,
  "rating": string,
  "reviewCount": string,
  "confidence": number
}

Rules:
- Prioritize exact visible text.
- If a field is not visible, return an empty string.
- confidence is 0-100.
- Return JSON only.`;

  const completion = await openai.chat.completions.create({
    model: OCR_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64Image } },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0,
  });

  const raw = completion.choices?.[0]?.message?.content || '';
  const parsed = safeJsonParse(raw);
  if (!parsed) {
    throw new Error('OCR vision pass did not return valid JSON');
  }

  return {
    text: parsed.rawText || [parsed.title, parsed.price, parsed.rating, parsed.reviewCount].filter(Boolean).join(' | '),
    confidence: Number(parsed.confidence || 0),
    lines: [],
    signals: {
      title: (parsed.title || '').trim(),
      price: (parsed.price || '').trim(),
      rating: (parsed.rating || '').trim(),
      reviewCount: (parsed.reviewCount || '').replace(/,/g, '').trim(),
    },
  };
}

function pickPreferredValue(field, ocrValue, visionValue, ocrConfidence) {
  const normalizedOcr = (ocrValue || '').trim();
  const normalizedVision = (visionValue || '').trim();
  if (!normalizedOcr && !normalizedVision) return '';
  if (!normalizedOcr) return normalizedVision;
  if (!normalizedVision) return normalizedOcr;

  const ocrStrong = ocrConfidence >= 75;
  const valueLooksNumeric = /price|rating|reviewCount/i.test(field);
  if (valueLooksNumeric && normalizedVision) return normalizedVision;
  return ocrStrong ? normalizedOcr : normalizedVision;
}

function buildFusedOutput({ ocr, ocrSignals, vision }) {
  const fusedTitle = pickPreferredValue('title', ocrSignals.title, vision.title, ocr.confidence);
  const fusedPrice = pickPreferredValue('price', ocrSignals.price, vision.price, ocr.confidence);
  const fusedRating = pickPreferredValue('rating', ocrSignals.rating, vision.rating, ocr.confidence);
  const fusedReviewCount = pickPreferredValue(
    'reviewCount',
    ocrSignals.reviewCount,
    vision.reviewCount,
    ocr.confidence,
  );

  // Filter out features that contain full base64 image data (snapshot itself, not product image)  
  const rawFeatures = Array.isArray(vision.features) ? vision.features : [];
  const features = rawFeatures.filter((f) => {
    const hasBase64Data = (f.dataDisplayed || '').startsWith('data:image/');
    return !hasBase64Data;
  });

  const prependFeature = (name, value, position, source) => {
    if (!value) return;
    if (features.some((feature) => (feature.name || '').toLowerCase().includes(name.toLowerCase()))) return;
    features.unshift({
      name,
      description: `${name} shown in snapshot`,
      dataDisplayed: value,
      position,
      visualStyling: 'As shown in screenshot',
      likelySource: source,
      requiredForImplementation: 'Yes',
      confidence: Math.round((Number(ocr.confidence || 0) + 80) / 2),
    });
  };

  prependFeature('Product Title', fusedTitle, 'Top product header', 'Product API');
  prependFeature('Price', fusedPrice, 'Near title / purchase area', 'Pricing API');

  if (fusedRating || fusedReviewCount) {
    prependFeature(
      'Rating and Review Summary',
      `${fusedRating || 'N/A'} stars${fusedReviewCount ? ` from ${Number(fusedReviewCount).toLocaleString()} reviews` : ''}`,
      'Near title / social proof area',
      'Reviews API',
    );
  }

  const visualAssets = Array.isArray(vision.visualAssets) ? vision.visualAssets : [];
  if (visualAssets.length > 0) {
    const visualSummary = visualAssets
      .slice(0, 8)
      .map((asset) => `${asset.type}${asset.label ? ` (${asset.label})` : ''}`)
      .join(', ');
    prependFeature('Visual Assets', visualSummary, 'Across snapshot', 'Design assets / Media CDN');
  }

  const apiDependencies = Array.isArray(vision.apiDependencies) ? vision.apiDependencies : [];
  const crossCheck = [];

  if (ocrSignals.title && vision.title && ocrSignals.title.toLowerCase() !== vision.title.toLowerCase()) {
    crossCheck.push(`Title mismatch: OCR="${ocrSignals.title}" vs Vision="${vision.title}"`);
  }
  if (ocrSignals.price && vision.price && ocrSignals.price !== vision.price) {
    crossCheck.push(`Price mismatch: OCR="${ocrSignals.price}" vs Vision="${vision.price}"`);
  }

  // Final filter: Remove any Product Image features that have base64 data URLs
  const finalFeatures = features.filter((f) => {
    const isProductImageFeature = (f.name || '').toLowerCase().includes('product image');
    const hasBase64DataUrl = (f.dataDisplayed || '').startsWith('data:image/');
    // Remove features that are BOTH a product image AND contain base64 data
    return !(isProductImageFeature && hasBase64DataUrl);
  });

  return {
    features: finalFeatures,
    apiDependencies,
    crossCheck,
    summary: {
      ocrConfidence: Number(ocr.confidence || 0),
      visualAssetsDetected: visualAssets.length,
      primaryImagePresent: !!vision.primaryImagePresent,
    },
  };
}

function toMarkdownReport(fused) {
  const featureMarkdown = fused.features
    .map((feature) => {
      const required = feature.requiredForImplementation || 'Yes';
      const dataType = feature.dataType || 'other';
      return `### [${feature.name || 'Unnamed Feature'}]\n- **Description**: ${feature.description || 'N/A'}\n- **Data displayed**: ${feature.dataDisplayed || ''}\n- **Data type**: ${dataType}\n- **Position**: ${feature.position || 'N/A'}\n- **Visual styling**: ${feature.visualStyling || 'N/A'}\n- **Likely API/source**: ${feature.likelySource || 'N/A'}\n- **Required for implementation**: ${required}`;
    })
    .join('\n\n');

  const depsMarkdown = fused.apiDependencies.length
    ? fused.apiDependencies
        .map((dep) => `- ${dep.name}: ${(dep.fields || []).join(', ') || 'N/A'}`)
        .join('\n')
    : '- Product API: title, description, price\n- Reviews API: rating, review count\n- Media CDN: product images and badges';

  const crossCheckMarkdown = fused.crossCheck.length
    ? fused.crossCheck.map((item) => `- ${item}`).join('\n')
    : '- No critical OCR/Vision conflicts detected.';

  return `## Product Display Features\n\n${featureMarkdown}\n\n## Data Dependencies Map\n${depsMarkdown}\n\n## Cross-Check Notes\n${crossCheckMarkdown}\n\n## Pipeline Confidence\n- OCR confidence: ${Math.round(fused.summary.ocrConfidence)}\n- Visual assets detected: ${fused.summary.visualAssetsDetected}\n- Primary image detected: ${fused.summary.primaryImagePresent ? 'Yes' : 'No'}`;
}

app.post('/api/analyze', async (req, res) => {
  try {
    let { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'no content' });
    }

    // Dual pipeline for image input: OCR + Vision + Fusion
    if (isBase64Image(content)) {
      console.log('Image detected. Running dual pipeline (OCR + Vision)...');
      let ocr = {
        text: '',
        confidence: 0,
        lines: [],
        signals: {
          title: '',
          price: '',
          rating: '',
          reviewCount: '',
        },
      };

      if (USE_TESSERACT_OCR) {
        const tesseractOcr = await extractTextFromImage(content);
        ocr = {
          ...tesseractOcr,
          signals: extractOcrSignals(tesseractOcr.text),
        };
      } else {
        try {
          ocr = await runVisionOcrAnalysis(content);
        } catch (ocrError) {
          console.error('Vision OCR pass failed:', ocrError.message);
        }
      }

      const ocrSignals = ocr.signals || extractOcrSignals(ocr.text);

      let vision;
      try {
        vision = await runVisionAnalysis(content);
      } catch (visionError) {
        console.error('Vision analysis failed, continuing with OCR fallback:', visionError.message);
        vision = {
          title: '',
          price: '',
          rating: '',
          reviewCount: '',
          primaryImagePresent: true,
          visualAssets: [],
          features: [],
          apiDependencies: [],
        };
      }

      const fused = buildFusedOutput({
        ocr,
        ocrSignals,
        vision,
      });

      const result = toMarkdownReport(fused);
      return res.json({
        result,
        debug: {
          mode: 'dual-pipeline',
          ocrSource: USE_TESSERACT_OCR ? 'tesseract' : 'vision-ocr-pass',
          ocrConfidence: ocr.confidence,
          crossCheckIssues: fused.crossCheck.length,
        },
      });
    }

    // Text-only path (non-image input)
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '... (truncated)';
    }

    const prompt = `You are a product display analyzer. Analyze the content and document ALL data/features displayed, focusing on WHAT information is shown and WHERE, not HOW it's technically built.

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
      model: TEXT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
      temperature: 0.2,
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
