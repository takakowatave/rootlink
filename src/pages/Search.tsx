import { useState } from "react";
import '../App.css'
import WordCard from '../components/WordCard'
import Layout from '../components/Layout'
import { checkIfWordExists, toggleSaveStatus, fetchWordlists } from '../lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from '../types';
import Sidebar from "../components/Sidebar";

type GeminiParsedResult = {
    main: WordInfo;
    synonyms?: WordInfo;
    antonyms?: WordInfo;
};


const Search = () => {
console.log("🔥 BUILD CHECK: Search page loaded");
const [input, setInput] = useState("");
const [inputError, setInputError] = useState("");
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
    if (!/^[a-zA-Z]+$/.test(input)) {
    setInputError("アルファベットのみ入力してください");
    return;
    } else {
    setInputError("");
    }

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

    // setSavedWords(savedWords.filter(w => w !== parsed.main.word));
    }
};


const handleToggleSave = async (word: WordInfo) => {
    const currentWords = await fetchWordlists(); //supabaseからデータ取得
    const isSaved = currentWords.some(w => w.word === word.word); //保存済みの単語と同じ文字列があるか
  //保存の上限設定
    if (!isSaved && currentWords.length >= 30) {
        toast.error("保存できる単語は30個までです");
        return;     
    }
    const result = await toggleSaveStatus(word, isSaved);
  //単語が保存済みかどうかをチェック

    if (result.success) {
        if (isSaved) {
        toast.success("保存を取り消しました");
        setSavedWords(savedWords.filter(w => w !== word.word));
        } else {
        toast.success("保存に成功しました");
        setSavedWords([...savedWords, result.word.word]);
        }
        } else { //それぞれのエラーハンドリング
        toast.error(isSaved ? "保存の取り消しに失敗しました" : "保存に失敗しました");
        }
};

const mainWord = wordList.find(w => w.label === "main");

return (
    <>
    <Toaster position="top-center" />
    <Layout
        sidebar={
            <Sidebar
            title={"保存した単語を\n確認してみよう"}
            imageSrc="/fav.png"
            buttonText="単語リストを確認"
            linkTo="/wordlist"
            />
        }
        >

        <div className="rounded-2xl w-full">
        <div className="mb-4">
        <div className="flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="検索ワードを入力"
            />
            <button 
            onClick={handleSearch} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            検索
            </button>
        </div>
        {inputError && (
            <p className="text-red-500 text-sm mt-2">{inputError}</p>
        )}
        </div>
        {mainWord && (
        <WordCard
            word={mainWord}
            label="main"
            savedWords={savedWords}
            onSave={handleToggleSave}
        />
        )}
        </div>
        <div>
        {
        // wordList の中にlabel が1つでもあるか
        wordList.some (w => w.label === "synonym" || w.label === "antonym")
        &&      
        // 必要なものだけを取り出す
        (wordList.filter(w => (w.label === "synonym" || w.label === "antonym") && w.word !== "None")
        .map((word) => (
        <div key={word.word}>
        <WordCard
            label={word.label}
            word={word}
            savedWords={savedWords}
            onSave={handleToggleSave}
        />
        </div> 
        ))
        )
        }
        </div>
    </Layout>
    </>
);
}

export default Search;

