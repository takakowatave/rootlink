import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'  // ← 追加！

const app = new Hono()

// ✅ CORSを有効化（全オリジン許可 or 限定も可）
app.use('*', cors({
  origin: '*', // ローカル確認用。必要に応じて限定もOK。
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => c.text('Hono server is running!'))

app.post('/chat', async (c) => {
  const { message } = await c.req.json()

  const prompt = `
  次の英単語「${message}」について、日本語で以下の形式の**JSON文字列のみ**を返してください。
  装飾や説明文は不要です。mainは検索結果で、mainの関連語をsynonyms、対義語をantonymsに表示してください。
  {
    "main": { "word": "単語", "meaning": "意味（日本語）", "pos": "品詞", "pronunciation": "発音記号", "example": "英語の例文", "translation": "例文の日本訳" },
    "synonyms": { "word": "単語", "meaning": "意味（日本語）", "pos": "品詞", "pronunciation": "発音記号", "example": "英語の例文", "translation": "例文の日本訳" },
    "antonyms": { "word": "単語", "meaning": "意味（日本語）", "pos": "品詞", "pronunciation": "発音記号", "example": "英語の例文", "translation": "例文の日本訳" }
  }`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    return c.json({ reply });
  } catch (error) {
    console.error('OpenAI呼び出しエラー:', error);
    return c.json({ error: 'Failed to fetch from OpenAI' }, 500);
  }
});

const port = Number(process.env.PORT) || 8080;
serve({ fetch: app.fetch, port });
console.log(`🚀 Server running on port ${port}`);
