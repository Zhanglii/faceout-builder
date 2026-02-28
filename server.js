require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/analyze', async (req, res) => {
  try {
    let { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'no content' });
    }

    // Limit input to prevent rate limit errors
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '... (truncated)';
    }

    const prompt = `Analyze this snapshot:\n\n${content}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // cheaper model, sufficient for most analysis
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,  // reduced from 1000
    });

    const result = completion.choices[0].message?.content || '';
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`AI server listening on ${port}`));
