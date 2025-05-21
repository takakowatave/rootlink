import { useState } from "react";
import './App.css'
import Header from './components/Header'
import { AiFillFolderAdd } from 'react-icons/ai'
import { FaVolumeHigh } from "react-icons/fa6";

type WordInfo = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  pronunciation: string;
  exampleEn: string;
  exampleJa: string;
}

const App = () => {
  const [input, setInput] = useState("");
  const [parsedResult, setParsedResult] = useState<WordInfo | null>(null);

  const handleSearch = async () => {
  const prompt = `
  次の英単語「${input}」について、日本語で以下の形式の**JSON文字列のみ**を返してください。装飾や説明文は不要です。

  {
    "word": "単語",
    "meaning": "意味（日本語）",
    "partOfSpeech": "品詞",
    "pronunciation": "発音記号",
    "exampleEn": "英語の例文",
    "exampleJa": "例文の日本訳"
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
  
try {
  // 返答から ```json や ``` を削除し、余分な改行も除く
  const cleaned = rawText?.replace(/```json|```/g, '').trim();

  const parsed = JSON.parse(cleaned || '');
  setParsedResult(parsed);
} catch (e) {
  console.error("JSONパースエラー", e);
  setParsedResult(null);
}
}
  return (
    <>
      <Header />
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
          <button className="absolute top-2 right-2 text-blue-500 hover:text-blue-600">
            <AiFillFolderAdd size={30

            } />
          </button>
          {/* <div className="flex items-center flex-wrap gap-4 mb-2">            
            <h2 className="text-2xl font-bold">quaint</h2>
            <FaVolumeHigh size={24}/>
            <span className="text-s text-gray-500">/kwent/</span>
            <span className="inline-block text-gray-600 rounded text-sm mt-1 px-2 py-0.4 border border-gray-400">
              adj
            </span>
          </div> */}
          <div className="mt-6 ml-6">
            {parsedResult && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{parsedResult.word}</h2>
                <FaVolumeHigh color="grey" size={24}/>
                </div>
                <span className="text-s text-gray-500 mr-2">{parsedResult.pronunciation}</span>
                <p className="inline-block text-gray-600 rounded text-sm mt-1 px-2 py-0.4 border border-gray-400">{parsedResult.partOfSpeech}</p>
                <p className="text-lg mt-2">{parsedResult.meaning}</p>
                <p className="mt-2 text-gray-600">{parsedResult.exampleEn}</p>
                <p className="mt-2 text-gray-600">{parsedResult.exampleJa}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}


export default App;
