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
    const [isLoading, setIsLoading] = useState(false);
    const [inputError, setInputError] = useState("");
    type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };
    const [wordList, setWordList] = useState<LabeledWord[]>([]);
    const [savedWords, setSavedWords] = useState<string[]>([]);

    //SP専用モーダル
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFab, setShowFab] = useState(false);
    const searchFormRef = useRef<HTMLFormElement>(null);

    //検索前のステート管理
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function isLabeledWord(word: LabeledWord | undefined): word is LabeledWord {
        return word !== undefined;
    }

    const parseOpenAIResponse = async (): Promise<GeminiParsedResult | undefined> => {
        const prompt = `
        次の英単語「${input}」について、日本語で以下の形式の**JSON文字列のみ**を返してください。装飾や説明文は不要です。
        mainは検索結果で、mainの関連語をsynonyms、対義語をantonymsに表示してください。
    {
        "main": {
            "word": "単語",
            "meaning": "意味（日本語）",
            "pos": "品詞",
            "pronunciation": "発音記号",
            "example": "英語の例文",
            "translation": "例文の日本訳"
        },
        "synonyms": {
            "word": "単語",
            "meaning": "意味（日本語）",
            "pos": "品詞",
            "pronunciation": "発音記号",
            "example": "英語の例文",
            "translation": "例文の日本訳"
        },
        "antonyms": {
            "word": "単語",
            "meaning": "意味（日本語）",
            "pos": "品詞",
            "pronunciation": "発音記号",
            "example": "英語の例文",
            "translation": "例文の日本訳"
        }
    }`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", // 必要に応じて変更
            messages: [{ role: "user", content: prompt }],
        }),
        });

        const data = await res.json();
        const rawText = data.choices?.[0]?.message?.content;
        console.log("OpenAI API response:", data);

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
    };

    const handleSearch = async (
        inputRef?: React.RefObject<HTMLInputElement | null>,
        shouldCloseModal: boolean = false
    ) => {
        if (!/^[a-zA-Z]+$/.test(input)) {
        setInputError("アルファベット・単語のみ入力してください");
        return;
        } else {
        setInputError("");
        }
        setIsLoading(true);
        try {
        const parsed = await parseOpenAIResponse();
        if (!parsed) return;

        console.log("AIの意味返答：", parsed.main.meaning);

        if (
            parsed &&
            (parsed.main.meaning.includes("該当する単語は見つかりません") ||
            parsed.main.meaning.includes("存在しません") ||
            parsed.main.meaning.includes("N/A"))
        ) {
            setWordList([]);
            return;
        }

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
        setIsLoading(false);
        setHasSearched(true);
        inputRef?.current?.blur();

        if (shouldCloseModal) {
            setIsModalOpen(false);
        }
        }
    };

    const handleToggleSave = async (word: WordInfo) => {
        const currentWords = await fetchWordlists();
        const isSaved = currentWords.some(w => w.word === word.word);

        if (!isSaved && currentWords.length >= 100) {
        toast.error("保存できる単語は100個までです");
        return;     
        }
        const result = await toggleSaveStatus(word, isSaved);

        if (result.success) {
        if (isSaved) {
            toast.success("単語をリストから外しました");
            setSavedWords(savedWords.filter(w => w !== word.word));
        } else {
            toast.success("単語をリストに追加しました");
            setSavedWords([...savedWords, result.word.word]);
        }
        } else {
        toast.error(isSaved ? "単語をリストから外せませんでした" : "リスト追加に失敗しました");
        }
    };

    const mainWord = wordList.find(w => w.label === "main");

    useEffect(() => {
        const observer = new IntersectionObserver(
        ([entry]) => {
            setShowFab(!entry.isIntersecting);
        },
        { threshold: 0 }
        );

        if (searchFormRef.current) {
        observer.observe(searchFormRef.current);
        }

        return () => observer.disconnect();
    }, []);

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
                    formRef={searchFormRef}
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
            {hasSearched && wordList.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                入力された単語は辞書に存在しませんでした。
                </div>
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
            {wordList.some(w => w.label === "synonym" || w.label === "antonym") &&
                wordList
                .filter(w => (w.label === "synonym" || w.label === "antonym") && w.word !== "None")
                .map((word) => (
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
    };

    export default Search;
