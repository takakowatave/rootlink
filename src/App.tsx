import { useState } from "react";
import './App.css'
import Header from './components/Header'
import WordCard from './components/WordCard'
import { saveWord, deleteWord, checkIfWordExists } from './lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from './types';


  type GeminiParsedResult = {
    main: WordInfo;
    synonyms?: WordInfo;
    antonyms?: WordInfo;
  };


const App = () => {
  const [input, setInput] = useState("");
  type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };
  const [wordList, setWordList] = useState<LabeledWord[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  function isLabeledWord(word: LabeledWord | undefined): word is LabeledWord {
  return word !== undefined;
}
  const parseGeminiResponse = async (): Promise<GeminiParsedResult | undefined> => {
    const prompt = `
    次の英単語「${input}」について、日本語で以下の形式の**JSON文字列のみ**を返してください。装飾や説明文は不要です。
    mainは検索結果で、mainの関連語をsynonyms、対義語をantonymsに表示してください。
  {
    "main": 
      {
        "word": "単語",
        "meaning": "意味（日本語）",
        "pos": "品詞",
        "pronunciation": "発音記号",
        "example": "英語の例文",
        "translation": "例文の日本訳"
      },
    "synonyms": 
      {
        "word": "単語",
        "meaning": "意味（日本語）",
        "pos": "品詞",
        "pronunciation": "発音記号",
        "example": "英語の例文",
        "translation": "例文の日本訳"
      },
    "antonyms": 
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
      setWordList([]);
      return;
    }
  }

  
  const handleSearch = async () => {
    const parsed = await parseGeminiResponse();
    if (!parsed) return;
    
    // tryの外で checkIfWordExists して、wordListにidつきで渡す
    const existing = await checkIfWordExists(parsed?.main);

  
    if (existing !== null) {
      setWordList([existing]);
      setSavedWords([...savedWords, existing.word]);
    } else {
        setWordList(
          [
            { ...parsed.main, label: "main" } as LabeledWord,
            parsed.synonyms
              ? { ...parsed.synonyms, label: "synonym" } as LabeledWord
              : undefined,
            parsed.antonyms
              ? { ...parsed.antonyms, label: "antonym" } as LabeledWord
              : undefined,
          ].filter(isLabeledWord)
        );

      setSavedWords(savedWords.filter(w => w !== parsed.main.word));
    }
  };


const handleToggleSave = async () => {
  if (!wordList.length) return;
    const target = wordList[0];
    
  if (!target.word || typeof target.word !== "string") return;
    const isSaved = savedWords.includes(target.word as string);
  if (isSaved) {
    console.log("削除直前の id:", target);
    if (!target.word) return;
    const success = await deleteWord(target);

    if (success) {
      toast.success("保存を取り消しました");
      setSavedWords(savedWords.filter(w => w !== target.word)); 
    } else {
      toast.error("削除に失敗しました");
    }
  } else {
    console.log("保存前のwordList:", wordList);

    const saved = await saveWord(target);
    
    if (saved?.id) {
      setSavedWords([...savedWords, target.word]);
      setWordList([saved]);
      toast.success("保存しました");
    } else {
      const existing = await checkIfWordExists(target);
      if (existing) {
        setWordList([existing]);
        setSavedWords(savedWords.filter(w => w !== target.word));

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
        {wordList.map((word) => (
          <div key={word.word}>
          <WordCard
            label={word.label}
            word={word}
            savedWords={savedWords}
            onSave={handleToggleSave}
          />

          </div>
        ))}

      </div>
    </div>
    </>
  );
}


export default App;
