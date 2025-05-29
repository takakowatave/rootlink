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
  
  const parseGeminiResponse = async () => {
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
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    try {
      const cleaned = rawText?.replace(/```json|```/g, '').trim();
      if (!cleaned) throw new Error("空のレスポンス");
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (e) {
      console.error("JSONパースエラー", e);
      setParsedResult(null);
      return;
    }
  }

  
  const handleSearch = async () => {
    const parsed = await parseGeminiResponse();
    // ✅ tryの外で checkIfWordExists して、parsedResultにidつきで渡す
    const existing = await checkIfWordExists(parsed);
  
    if (existing) {
      setParsedResult(existing);
      setIsSaved(true);
    } else {
      setParsedResult(parsed);
      setIsSaved(false);
    }
  };


const handleToggleSave = async () => {
  if (!parsedResult) return;
  if (isSaved) {

    console.log("削除直前の id:", parsedResult.id);

    const success = await deleteWord(parsedResult);

    if (success) {
      toast.success("保存を取り消しました");
      setIsSaved(false);
    } else {
      toast.error("削除に失敗しました");
    }
  } else {
    console.log("保存前のparsedResult:", parsedResult);

    const saved = await saveWord(parsedResult);
    
    if (saved?.id) {
      setIsSaved(true);
      setParsedResult(saved);
      toast.success("保存しました");
    } else {
      const existing = await checkIfWordExists(parsedResult);
      if (existing) {
        setParsedResult(existing);
        setIsSaved(true);
      } else {
        setParsedResult(parsedResult);
        setIsSaved(false);
      }
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
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            検索
          </button>
        </div>
        {parsedResult && (
          <div key={parsedResult.word}>
          <WordCard
            label="antonym"
            word={parsedResult}
            isSaved={isSaved}
            onSave={handleToggleSave}
          />

          </div>
        )}

      </div>
    </div>
    </>
  );
}


export default App;
