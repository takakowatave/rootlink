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
  const [editingWordId, setEditingWordId] = useState<string | null>(null);

  // -----------------------------
  // タグ更新処理（Supabase）
  // -----------------------------
  const updateTags = async (savedWordId: string, tags: string[]) => {

    // ⭐ Supabase の返却構造を TS に教える
    type ExistingLink = {
      tag_id: string;
      tag: { name: string } | null;
    };

    const { data } = await supabase
      .from("saved_word_tags")
      .select(`
        tag_id,
        tag:tag_id (
          name
        )
      `)
      .eq("saved_word_id", savedWordId);

    const existingLinks = data as ExistingLink[] | null;

    const existingTagNames =
      existingLinks?.map((row) => row.tag?.name ?? "") ?? [];

    const toAdd = tags.filter((t) => !existingTagNames.includes(t));
    const toRemove = existingTagNames.filter((t) => !tags.includes(t));

    // --- 追加処理 ---
    for (const name of toAdd) {
      let { data: tag } = await supabase
        .from("tag")
        .select("*")
        .eq("name", name)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from("tag")
          .insert({ name })
          .select()
          .single();
        tag = newTag;
      }

      await supabase.from("saved_word_tags").insert({
        saved_word_id: savedWordId,
        tag_id: tag.id,
      });
    }

    // --- 削除処理 ---
    for (const name of toRemove) {
      const { data: tag } = await supabase
        .from("tag")
        .select("*")
        .eq("name", name)
        .single();

      if (!tag) continue;

      await supabase
        .from("saved_word_tags")
        .delete()
        .eq("saved_word_id", savedWordId)
        .eq("tag_id", tag.id);
    }

    toast.success("タグを更新しました！");
  };

  // -----------------------------
  // 保存・削除
  // -----------------------------
  const handleToggleSave = async (word: WordInfo) => {
    const res = await supabase.auth.getUser();
    const currentUser = res.data.user;

    if (!currentUser) {
      toast.error("ログインが必要です");
      return;
    }

    const currentWords = await fetchWordlists(currentUser.id);
    const isSaved = currentWords.some((w) => w.word === word.word);

    if (!isSaved && currentWords.length >= 500) {
      toast.error("保存できる単語は500個までです");
      return;
    }

    if (isSaved) {
      setWordList((prev) => prev.filter((w) => w.word !== word.word));
    }

    const result = await toggleSaveStatus(word, isSaved);

    if (result.success) {
      if (isSaved) {
        toast.success("保存を取り消しました");
        setSavedWords((prev) => prev.filter((w) => w !== word.word));
      } else {
        toast.success("保存しました");
        setSavedWords((prev) => [...prev, result.word.word]);
      }
    }
  };

  // -----------------------------
  // 初期ロード
  // -----------------------------
  useEffect(() => {
    const loadSavedWords = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const words = await fetchWordlists(user.id);
      setWordList(words);
      setSavedWords(words.map((w) => w.word));
    };

    loadSavedWords();
  }, []);

  // -----------------------------
  // レンダリング
  // -----------------------------
  return (
    <>
      <Toaster position="top-center" />

      <div className="w-full">
        {[...wordList].slice().reverse().map((item) => (
          <WordCard
            key={item.id}
            word={item}
            savedWords={savedWords}
            onSave={handleToggleSave}
            isEditing={editingWordId === item.id}
            onEdit={() => setEditingWordId(item.id)}
            onFinishEdit={(tags) => {
              updateTags(item.id, tags);
              setEditingWordId(null);
            }}
          />
        ))}
      </div>
    </>
  );
};

export default WordList;
