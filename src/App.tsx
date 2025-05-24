import { useState } from "react";
import './App.css'
import Header from './components/Header'
import WordCard from './components/WordCard'
import { saveWord, deleteWord, checkIfWordExists } from './lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from './types';


const App = () => {
  const [input, setInput] = useState("");
  const [parsedResult, setParsedResult] = useState<WordInfo | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const handleSearch = async () => {
  const prompt = `
  次の英単語「${input}」について、日本語で以下の形式の**JSON文字列のみ**を返してください。装飾や説明文は不要です。

  {
    "word": "単語",
    "meaning": "意味（日本語）",
    "pos": "品詞",
    "pronunciation": "発音記号",
    "example": "英語の例文",
    "translation": "例文の日本訳"
  }
  `;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text; //rawText = Geminiの返答そのまま  

let parsed = null;
    
try {
  // 返答から ```json や ``` を削除し、余分な改行も除く
  const cleaned = rawText?.replace(/```json|```/g, '').trim();

  parsed = JSON.parse(cleaned || '');
  parsed.pos = typeof parsed.pos === 'string'
  ? parsed.pos.split(/[,、、 ]+/).filter(Boolean)
  : [];
  setParsedResult(parsed);
    } catch (e) {
      console.error("JSONパースエラー", e);
      setParsedResult(null);
    }
      // 検索後に追加する
    const exists = await checkIfWordExists(parsed);
    setIsSaved(Boolean(exists));
}

const handleToggleSave = async () => {
  if (!parsedResult) return;

  if (isSaved) {
    const success = await deleteWord(parsedResult);
    if (success) {
      toast.success("保存を取り消しました");
      setIsSaved(false);
      setParsedResult({ ...parsedResult }); // ← 同じ内容だけど再セット
    }
  } else {
    const success = await saveWord(parsedResult);
    if (success) {
      toast.success("保存しました");
      setIsSaved(true);
      setParsedResult({ ...parsedResult }); // ← 同じ内容だけど再セット
    }
  }
};

  return (
    <>
      <Header />
      <Toaster position="top-center" />
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-12">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">英単語検索</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="検索ワードを入力"
          />
          <button  onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            検索
          </button>
        </div>
        <div className="relative bg-white rounded px-3 p-4 border border-gray-200 mt-6 w-full max-w-xl">
          <div className="mt-6 ml-6">
            {parsedResult && (
              <WordCard
                word={parsedResult}
                isSaved={isSaved}
                onSave={handleToggleSave}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}


export default App;

