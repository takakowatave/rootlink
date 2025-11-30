import { useState, useEffect } from "react";
import "../App.css";
import WordCard from "../components/WordCard";
import { fetchWordlists, toggleSaveStatus } from "../lib/supabaseApi";
import toast, { Toaster } from "react-hot-toast";
import type { WordInfo } from "../types";
import { supabase } from "../lib/supabaseClient";

const WordList = () => {
  type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };

  const [wordList, setWordList] = useState<LabeledWord[]>([]);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // 保存・削除切り替え
  const handleToggleSave = async (word: WordInfo) => {
    const res = await supabase.auth.getUser();
    const currentUser = res.data.user;

    if (!currentUser) {
      toast.error("ログインが必要です");
      return;
    }

    const currentWords = await fetchWordlists(currentUser.id);
    const isSaved = currentWords.some((w) => w.word === word.word);

    // 上限チェック
    if (!isSaved && currentWords.length >= 30) {
      toast.error("保存できる単語は30個までです");
      return;
    }

    // 表示から削除（削除の場合）
    if (isSaved) {
      setWordList((prev) => prev.filter((w) => w.word !== word.word));
    }

    // supabase 更新
    const result = await toggleSaveStatus(word, isSaved);

    if (result.success) {
      if (isSaved) {
        toast.success("保存を取り消しました");
        setSavedWords((prev) => prev.filter((w) => w !== word.word));
      } else {
        toast.success("保存しました");
        setSavedWords((prev) => [...prev, result.word.word]);
      }
    } else {
      toast.error("更新に失敗しました");
    }
  };

  // 初期ロード
  useEffect(() => {
    const loadSavedWords = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("ログインが必要です");
        return;
      }

      const words = await fetchWordlists(user.id);
      setWordList(words);
      setSavedWords(words.map((w) => w.word));
    };

    loadSavedWords();
  }, []);

  return (
    <>
      <Toaster position="top-center" />

      {/* Layout は使わない（App.tsxで包む） */}
      <div className="w-full">
        {/* 右側サイドバーは App の Layout に任せる */}
        {[...wordList]
          .slice()
          .reverse()
          .map((item) => (
            <WordCard
              key={item.word}
              word={item}
              savedWords={savedWords}
              onSave={handleToggleSave}
              data-testid="saved-word"
            />
          ))}
      </div>
    </>
  );
};

export default WordList;
