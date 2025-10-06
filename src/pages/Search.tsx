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

// ✅ OpenAIのパース結果型
type GeminiParsedResult = {
  main: WordInfo;
  synonyms?: WordInfo;
  antonyms?: WordInfo;
};

// ✅ UI上で扱う型（main / synonym / antonym のラベル付き）
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

  // ✅ Cloud Run 経由で Hono → OpenAI を呼び出し & パース
  const parseOpenAIResponse = async (
    word: string
  ): Promise<GeminiParsedResult | undefined> => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: word }),
      });

      const data = await res.json();
      console.log("Hono API response:", data);

      const cleaned = data.reply?.replace(/```json|```/g, "").trim();
      if (!cleaned) throw new Error("空のレスポンス");

      const parsed: GeminiParsedResult = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error("JSONパースエラー:", err);
      toast.error("AIからの応答を解析できませんでした");
      return;
    }
  };

  // ✅ 検索実行
  const handleSearch = async (
    inputRef?: React.RefObject<HTMLInputElement | null>,
    shouldCloseModal = false
  ) => {
    if (!/^[a-zA-Z]+$/.test(input)) {
      setInputError("アルファベットのみ入力してください");
      return;
    } else {
      setInputError("");
    }

    setIsLoading(true);
    try {
      const parsed = await parseOpenAIResponse(input);
      if (!parsed) return;

      const existing = await checkIfWordExists(parsed.main);
      if (existing) {
        setWordList([existing]);
        setSavedWords([...savedWords, existing.word]);
      } else {
        // ✅ undefined を含まない安全な配列構築
    const labeledList: LabeledWord[] = [
    { ...parsed.main, label: "main" as const },
    ...(parsed.synonyms ? [{ ...parsed.synonyms, label: "synonym" as const }] : []),
    ...(parsed.antonyms ? [{ ...parsed.antonyms, label: "antonym" as const }] : []),
    ];


        setWordList(labeledList);
      }
    } finally {
      setIsLoading(false);
      setHasSearched(true);
      inputRef?.current?.blur();
      if (shouldCloseModal) setIsModalOpen(false);
    }
  };

  // ✅ スクロール監視で Fab 表示制御
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
              key={word.word}
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
