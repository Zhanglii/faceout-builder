require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/analyze', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'no content' });
    }

    const prompt = `Analyze this snapshot:\n\n${content}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    });

    const result = completion.data.choices[0].message?.content || '';
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`AI server listening on ${port}`));
