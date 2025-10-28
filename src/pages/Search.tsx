// ✅ Search.tsx
import { useState, useRef, useEffect } from "react";
import "../App.css";
import WordCard from "../components/WordCard";
import SearchForm from "../components/SearchForm";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import Fab from "../components/Fab";
import SearchModal from "../components/SearchModal";
import toast, { Toaster } from "react-hot-toast";
import type { WordInfo } from "../types";
import { checkIfWordExists, toggleSaveStatus } from "../lib/supabaseApi";

type AiParsedResult = {
  main: WordInfo;
  related?: {
    synonyms?: string[];
    antonyms?: string[];
    derivedWords?: string[];
    collocations?: string[];
  };
};

type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };

const Search = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [wordList, setWordList] = useState<LabeledWord[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchFormRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Cloud Run経由でAI呼び出し
  const parseOpenAIResponse = async (
    word: string
  ): Promise<AiParsedResult | undefined> => {
    try {
      const API_URL = import.meta.env.VITE_CLOUDRUN_API_URL;
      if (!API_URL) throw new Error("VITE_CLOUDRUN_API_URL is not defined");

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: word }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      return await res.json();
    } catch (err) {
      console.error("❌ JSONパースエラー:", err);
      toast.error("AIからの応答を解析できませんでした");
    }
  };

  // ✅ 単語を詳細化（保湿）
  const hydrateWord = async (word: LabeledWord): Promise<LabeledWord> => {
    // すでに meaning があるならスキップ
    if (word.meaning) return word;

    const detail = await parseOpenAIResponse(word.word);
    if (detail?.main) {
      return { ...detail.main, label: word.label };
    }
    return word;
  };

  // ✅ 検索実行
  const handleSearch = async (
    inputRef?: React.RefObject<HTMLInputElement | null>,
    shouldCloseModal = false
  ) => {
    if (!/^[a-zA-Z]+$/.test(input)) {
      setInputError("アルファベットのみ入力してください");
      return;
    }
    setInputError("");
    setIsLoading(true);

    try {
      const parsed = await parseOpenAIResponse(input);
      if (!parsed) return;

      const existing = await checkIfWordExists(parsed.main);
      if (existing) {
        setWordList([existing]);
        setSavedWords([...savedWords, existing.word]);
      } else {
        // main + synonym + antonym
        const labeledList: LabeledWord[] = [
          { ...parsed.main, label: "main" as const },
          

        // ✅ 関連語（synonyms）→ 1つだけ取得
        ...(parsed.related?.synonyms
          ? parsed.related.synonyms.slice(0, 1).map((s) => ({
              word: s,
              meaning: "",
              partOfSpeech: [],
              pronunciation: "",
              example: "",
              translation: "",
              label: "synonym" as const,
            }))
          : []),

        // ✅ 対義語（antonyms）→ 1つだけ取得
        ...(parsed.related?.antonyms
          ? parsed.related.antonyms.slice(0, 1).map((a) => ({
              word: a,
              meaning: "",
              partOfSpeech: [],
              pronunciation: "",
              example: "",
              translation: "",
              label: "antonym" as const,
            }))
          : []),
        ];

      // ✅ 関連語も詳細情報を取得してから表示
      const hydrated = await Promise.all(labeledList.map(hydrateWord));

      // ✅ 各カテゴリで1件ずつに絞る
      const filtered = hydrated.filter((w, i, arr) =>
        w.label === "main" ||
        (w.label === "synonym" &&
          arr.findIndex(x => x.label === "synonym") === i) ||
        (w.label === "antonym" &&
          arr.findIndex(x => x.label === "antonym") === i)
      );

      // ✅ 表示用リストをセット
      setWordList(filtered);
      }
      
    } finally {
      setIsLoading(false);
      setHasSearched(true);
      inputRef?.current?.blur();
      if (shouldCloseModal) setIsModalOpen(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (searchFormRef.current) observer.observe(searchFormRef.current);
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

          {!hasSearched && (
            <img
              src="/empty.png"
              alt="empty"
              className="w-full mx-auto rounded-2xl bg-white border"
            />
          )}

          {hasSearched && wordList.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              該当する単語が見つかりませんでした。
            </p>
          )}

          {wordList.map((word) => (
            <WordCard
              key={`${word.word}-${savedWords.includes(word.word)}`} // 👈 これに変更！
              label={word.label}
              word={word}
              savedWords={savedWords}
              onSave={async (w) => {
                const result = await toggleSaveStatus(
                  w,
                  savedWords.includes(w.word)
                );
                if (result.success) {
                  setSavedWords((prev) =>
                    prev.includes(w.word)
                      ? prev.filter((x) => x !== w.word)
                      : [...prev, w.word]
                  );
                  toast.success(result.success ? "更新しました" : "失敗しました");
                }
              }}
            />
          ))}
        </div>
      </Layout>

      {!isModalOpen && (
        <Fab isVisible={showFab} onClick={() => setIsModalOpen(true)} />
      )}

      {isModalOpen && (
        <SearchModal
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
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
