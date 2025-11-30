// Search.tsx（Layout を外した版）

import { useState, useRef, useEffect } from "react";
import "../App.css";

// --- UIパーツ ---
import WordCard from "../components/WordCard";
import SearchForm from "../components/SearchForm";
import Fab from "../components/Fab";
import SearchModal from "../components/SearchModal";

import toast, { Toaster } from "react-hot-toast";
import type { WordInfo } from "../types";
import { checkIfWordExists, toggleSaveStatus } from "../lib/supabaseApi";

// --- AI応答の型 ---
type AiParsedResult = {
  main: WordInfo;
  related?: {
    synonyms?: string[];
    antonyms?: string[];
    derivedWords?: string[];
    collocations?: string[];
  };
};

// --- ラベル付き単語 ---
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

  // ----- AI API -----
  const parseOpenAIResponse = async (word: string): Promise<AiParsedResult | undefined> => {
    try {
      const API_URL = import.meta.env.VITE_CLOUDRUN_API_URL;
      if (!API_URL) throw new Error("VITE_CLOUDRUN_API_URL is not defined");

      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: word }),
      });

      if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

      return await res.json();
    } catch (err) {
      console.error("❌ error:", err);
      toast.error("AIからの応答を解析できませんでした");
    }
  };

  const hydrateWord = async (word: LabeledWord): Promise<LabeledWord> => {
    if (word.meaning) return word;

    const detail = await parseOpenAIResponse(word.word);
    if (detail?.main) return { ...detail.main, label: word.label };
    return word;
  };

  // ----- 検索 -----
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
        const labeledList: LabeledWord[] = [
          { ...parsed.main, label: "main" as const },
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

        const hydrated = await Promise.all(labeledList.map(hydrateWord));

        const filtered = hydrated.filter((w, i, arr) =>
          w.label === "main" ||
          (w.label === "synonym" && arr.findIndex((x) => x.label === "synonym") === i) ||
          (w.label === "antonym" && arr.findIndex((x) => x.label === "antonym") === i)
        );

        setWordList(filtered);
      }
    } finally {
      setIsLoading(false);
      setHasSearched(true);
      inputRef?.current?.blur();
      if (shouldCloseModal) setIsModalOpen(false);
    }
  };

  // ----- FAB表示制御 -----
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

      {/* ここに Layout は置かない */}

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
            key={`${word.word}-${savedWords.includes(word.word)}`}
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
                toast.success("更新しました");
              } else {
                toast.error("失敗しました");
              }
            }}
          />
        ))}
      </div>

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
