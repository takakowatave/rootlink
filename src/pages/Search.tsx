// ✅ Search.tsx
// このファイルは「検索ページ」のメインコンポーネント。
// 役割：ユーザーが単語を入力 → APIを叩く → 結果（main, synonym, antonym）を表示 → 保存できる。
// React Hooks(useState/useEffect)とカスタムコンポーネントを組み合わせて動作している。

import { useState, useRef, useEffect } from "react";
import "../App.css";

// --- UIパーツの読み込み ---
import WordCard from "../components/WordCard";        // 単語カード（表示・保存ボタン付き）
import SearchForm from "../components/SearchForm";    // 検索フォーム（入力欄＋ボタン）
import Layout from "../components/Layout";            // ページ全体のレイアウト
import Sidebar from "../components/Sidebar";          // 右側の案内（「保存した単語を確認しよう」など）
import Fab from "../components/Fab";                  // 画面右下の＋ボタン（モーダルを開く）
import SearchModal from "../components/SearchModal";  // 検索用モーダルウィンドウ

// --- ライブラリ ---
import toast, { Toaster } from "react-hot-toast";     // トースト通知（保存完了など）
import type { WordInfo } from "../types";             // 単語データの型定義
import { checkIfWordExists, toggleSaveStatus } from "../lib/supabaseApi"; // Supabase関連関数（DB操作）

// --- AIの応答構造を定義 ---
// OpenAI APIから返ってくるJSONの型を定義している。
// main → 検索した単語本体
// related → 関連語・対義語など
type AiParsedResult = {
  main: WordInfo;
  related?: {
    synonyms?: string[];
    antonyms?: string[];
    derivedWords?: string[];
    collocations?: string[];
  };
};

// --- 各単語に「main」「synonym」「antonym」ラベルをつけるための型 ---
type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };


// ==============================
// 🧩 メインコンポーネント
// ==============================
const Search = () => {
  const [input, setInput] = useState("");               // 検索入力欄の文字列
  const [isLoading, setIsLoading] = useState(false);    // ローディング中か
  const [inputError, setInputError] = useState("");     // 入力エラー文言（例：日本語が混じってる）
  const [wordList, setWordList] = useState<LabeledWord[]>([]); // 表示する単語カード（main+関連語）
  const [savedWords, setSavedWords] = useState<string[]>([]);  // 保存済みの単語（例："run","walk"）
  const [isModalOpen, setIsModalOpen] = useState(false);       // モーダル開閉状態
  const [showFab, setShowFab] = useState(false);               // 右下のFABボタンを表示するか
  const [hasSearched, setHasSearched] = useState(false);       // 一度でも検索をしたか（初期画像切り替え用）

  // --- 参照（useRef）: DOM要素を直接扱いたいときに使う ---
  const searchFormRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ==============================
  // ☁️ AI API呼び出し
  // ==============================
  const parseOpenAIResponse = async (
    word: string
  ): Promise<AiParsedResult | undefined> => {
    try {
      // .envファイルからAPIのURLを読み取る
      const API_URL = import.meta.env.VITE_CLOUDRUN_API_URL;
      if (!API_URL) throw new Error("VITE_CLOUDRUN_API_URL is not defined");

      // Cloud Run経由でAIサーバーにリクエスト送信
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: word }), // ユーザー入力をAIに送信
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      // JSONとして返す（main, related含む）
      return await res.json();
    } catch (err) {
      console.error("❌ JSONパースエラー:", err);
      toast.error("AIからの応答を解析できませんでした");
    }
  };

  // ==============================
  // 💧 hydrateWord：関連語にも詳細をつける
  // ==============================
  // synonym/antonymは最初意味などが空なので、
  // それぞれに対して再度AI APIを呼び出して「詳細化」する。
  const hydrateWord = async (word: LabeledWord): Promise<LabeledWord> => {
    // すでにmeaning（意味）がある＝mainならそのまま返す
    if (word.meaning) return word;

    // AIに問い合わせて意味などを取得
    const detail = await parseOpenAIResponse(word.word);
    if (detail?.main) {
      return { ...detail.main, label: word.label };
    }
    return word;
  };

  // ==============================
  // 🔍 handleSearch：検索の実行
  // ==============================
  const handleSearch = async (
    inputRef?: React.RefObject<HTMLInputElement | null>,
    shouldCloseModal = false
  ) => {
    // --- 入力バリデーション ---
    if (!/^[a-zA-Z]+$/.test(input)) {
      setInputError("アルファベットのみ入力してください");
      return;
    }

    // --- 初期化 ---
    setInputError("");
    setIsLoading(true);

    try {
      // --- AIから情報取得 ---
      const parsed = await parseOpenAIResponse(input);
      if (!parsed) return;

      // --- Supabaseに既存データがあるかチェック ---
      const existing = await checkIfWordExists(parsed.main);

      if (existing) {
        // すでに保存済みならそのデータを表示
        setWordList([existing]);
        setSavedWords([...savedWords, existing.word]);
      } else {
        // --- main + synonym + antonym を作成 ---
        const labeledList: LabeledWord[] = [
          { ...parsed.main, label: "main" as const },

          // 関連語：最大1件のみ
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

          // 対義語：最大1件のみ
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

        // --- 関連語も含め、全て詳細化 ---
        const hydrated = await Promise.all(labeledList.map(hydrateWord));

        // --- main/synonym/antonym 各1件に絞り込み ---
        const filtered = hydrated.filter((w, i, arr) =>
          w.label === "main" ||
          (w.label === "synonym" &&
            arr.findIndex(x => x.label === "synonym") === i) ||
          (w.label === "antonym" &&
            arr.findIndex(x => x.label === "antonym") === i)
        );

        // --- 最終的に表示する単語リストを更新 ---
        setWordList(filtered);
      }

    } finally {
      // --- ローディング終了・後処理 ---
      setIsLoading(false);
      setHasSearched(true);
      inputRef?.current?.blur(); // フォーカス解除
      if (shouldCloseModal) setIsModalOpen(false); // モーダルを閉じる
    }
  };

  // ==============================
  // 🎈 スクロール監視（FABボタンの表示制御）
  // ==============================
  useEffect(() => {
    // IntersectionObserverを使ってフォームが見えているかチェック
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    );

    if (searchFormRef.current) observer.observe(searchFormRef.current);
    return () => observer.disconnect();
  }, []);

  // ==============================
  // 🖥️ レンダリング部分
  // ==============================
  return (
    <>
      {/* トースト通知 */}
      <Toaster position="top-center" />

      {/* 全体レイアウト */}
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

        {/* --- 検索フォーム --- */}
        <div className="rounded-2xl w-full">
          <SearchForm
            inputRef={inputRef}
            formRef={searchFormRef}
            input={input}
            onInputChange={(e) => setInput(e.target.value)} // 入力更新
            onSearch={() => handleSearch(inputRef)}         // 検索実行
            error={inputError}
            placeholder="検索ワードを入力"
            isLoading={isLoading}
          />

          {/* --- 初期状態（検索前） --- */}
          {!hasSearched && (
            <img
              src="/empty.png"
              alt="empty"
              className="w-full mx-auto rounded-2xl bg-white border"
            />
          )}

          {/* --- 検索後・結果が空 --- */}
          {hasSearched && wordList.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              該当する単語が見つかりませんでした。
            </p>
          )}

          {/* --- 検索結果（main + synonym + antonym） --- */}
          {wordList.map((word) => (
            <WordCard
              // keyを保存状態に依存させて強制再レンダー
              key={`${word.word}-${savedWords.includes(word.word)}`}
              label={word.label}
              word={word}
              savedWords={savedWords}
              onSave={async (w) => {
                // 保存／解除処理（Supabase更新）
                const result = await toggleSaveStatus(
                  w,
                  savedWords.includes(w.word)
                );
                if (result.success) {
                  // UI上の保存状態を即時更新
                  setSavedWords((prev) =>
                    prev.includes(w.word)
                      ? prev.filter((x) => x !== w.word) // 解除
                      : [...prev, w.word]                // 保存
                  );
                  toast.success("更新しました");
                } else {
                  toast.error("失敗しました");
                }
              }}
            />
          ))}
        </div>
      </Layout>

      {/* --- FABボタン（下部から検索モーダルを開く） --- */}
      {!isModalOpen && (
        <Fab isVisible={showFab} onClick={() => setIsModalOpen(true)} />
      )}

      {/* --- モーダル表示中 --- */}
      {isModalOpen && (
        <SearchModal
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          error={inputError}
          isLoading={isLoading}
          formRef={searchFormRef}
          onClose={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
          onSearch={() => handleSearch(inputRef, true)} // モーダル閉じながら検索
          inputRef={inputRef}
        />
      )}
    </>
  );
};

export default Search;
