
import { useState, useEffect, useRef } from "react";
import '../App.css'
import WordCard from '../components/WordCard'
import SearchForm from '../components/SearchForm'
import Layout from '../components/Layout'
import { checkIfWordExists, toggleSaveStatus, fetchWordlists } from '../lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from '../types';
import Sidebar from "../components/Sidebar";
import Fab from "../components/Fab";
import SearchModal from "../components/SearchModal";

type GeminiParsedResult = {
    main: WordInfo;
    synonyms?: WordInfo;
    antonyms?: WordInfo;
};

const Search = () => {
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false)
const [inputError, setInputError] = useState("");
type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };
const [wordList, setWordList] = useState<LabeledWord[]>([]);
const [savedWords, setSavedWords] = useState<string[]>([]);

//SP専用モーダル
const [isModalOpen, setIsModalOpen] = useState(false);

const [showFab, setShowFab] = useState(false);
const searchFormRef = useRef<HTMLFormElement>(null);

//PC

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

const handleSearch = async (inputRef?: React.RefObject<HTMLInputElement | null>, shouldCloseModal: boolean = false) => {
    if (!/^[a-zA-Z]+$/.test(input)) {
    setInputError("アルファベット・単語のみ入力してください");
    return;
    } else {
    setInputError("");
    }
    setIsLoading(true);
    try {
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
    }
    } finally {
        setIsLoading(false); // 成功・失敗どちらでも必ず止まるように
        setHasSearched(true); //emptyのカード出すための処理
        inputRef?.current?.blur(); // 検索後のフォーカスを外すための処理
      
        if (shouldCloseModal) {
          setIsModalOpen(false);
        }
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
        toast.success("単語をリストから外しました");
        setSavedWords(savedWords.filter(w => w !== word.word));
        } else {
        toast.success("単語をリストに追加しました");
        setSavedWords([...savedWords, result.word.word]);
        }
        } else { //それぞれのエラーハンドリング
        toast.error(isSaved ? "単語をリストから外せませんでした" : "リスト追加に失敗しました");
        }
};

const mainWord = wordList.find(w => w.label === "main");
    
    useEffect(() => {
    // IntersectionObserverを新しく作成（entryで監視対象の状態を受け取る）
    const observer = new IntersectionObserver(
        ([entry]) => {
        // 監視対象が画面内に表示されていない場合（isIntersectingがfalse）、FABを表示
        setShowFab(!entry.isIntersecting);
        },
        { threshold: 0 } // 0%でも表示されていれば「見えている」と判定する
    );

    // 監視対象の要素が存在していれば、observerに登録
    if (searchFormRef.current) {
        observer.observe(searchFormRef.current);
    }

    // コンポーネントがアンマウントされた時、observerを解除（メモリリーク防止）
    return () => observer.disconnect();
    }, []);


  //検索前の最初のステート管理
    const [hasSearched, setHasSearched] = useState(false);

  //フォームのフォーカスを外すための処理
    const inputRef = useRef<HTMLInputElement>(null);

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
            <SearchForm
                inputRef={inputRef}
                formRef={searchFormRef} //このDOM要素を監視対象として指定する
                input={input}
                onInputChange={(e) => setInput(e.target.value)}
                onSearch={() => handleSearch(inputRef)}
                error={inputError}
                placeholder="検索ワードを入力"
                isLoading={isLoading}
            />
        </div>
        </div>
        {!hasSearched && (
        <img src="/empty.png" alt="empty card" className="w-full mx-auto rounded-2xl bg-white border border-gray-200" />
        )}
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
        {!isModalOpen && (
            <Fab isVisible={showFab} onClick={() => setIsModalOpen(true)} />
        )}
        {isModalOpen && (
            <SearchModal 
                input={input} 
                onInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                error={inputError} 
                isLoading={isLoading} 
                formRef={searchFormRef}
                onClose={() => setIsModalOpen(false)}
                isOpen={isModalOpen}
                onSearch={() => handleSearch(inputRef, true)}
                inputRef={inputRef}
                />
            )}
        
</>
);
}

export default Search;
