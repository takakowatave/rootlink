// ==============================
// WordList.tsx
// ==============================

import { useState, useEffect } from "react";
import "../App.css";
import WordCard from "../components/WordCard";
import { fetchWordlists, toggleSaveStatus } from "../lib/supabaseApi";
import toast, { Toaster } from "react-hot-toast";
import type { WordInfo } from "../types";
import { supabase } from "../lib/supabaseClient";

const WordList = () => {
  // WordInfo に「関連語のラベル（synonym / antonym）」を追加した型
  type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };

  // 画面に描画する単語リスト（saved_words に保存された語）
  const [wordList, setWordList] = useState<LabeledWord[]>([]);

  // ブックマークされている単語名一覧
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // 現在「編集モード」に入っている単語の saved_word_id/word_id（ユニークキー）
  const [editingWordId, setEditingWordId] = useState<string | null>(null);

  // ==============================
  // ▼ react-select 用：既存の全タグ
  // ==============================
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const loadAllTags = async () => {
      const { data } = await supabase.from("tag").select("name");
      setAllTags(data?.map((t) => t.name) ?? []);
    };
    loadAllTags();
  }, []);

  // ==============================
  // ▼ タグ更新処理（saved_word_tags の更新）
  // ==============================
  const updateTags = async (savedWordId: string, tags: string[]) => {
    // Supabase の返却構造に型を付ける
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

    // 既存タグ名一覧
    const existingTagNames =
      existingLinks?.map((row) => row.tag?.name ?? "") ?? [];

    // 差分計算
    const toAdd = tags.filter((t) => !existingTagNames.includes(t));
    const toRemove = existingTagNames.filter((t) => !tags.includes(t));

    // ------------------------------
    // 追加処理
    // ------------------------------
    for (const name of toAdd) {
      let { data: tag } = await supabase
        .from("tag")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      // 無ければ新規作成
      if (!tag) {
        const { data: newTag } = await supabase
          .from("tag")
          .insert({ name })
          .select()
          .maybeSingle();
        tag = newTag;
      }

      // saved_word_tags に紐付けを保存
      await supabase.from("saved_word_tags").insert({
        saved_word_id: savedWordId,
        tag_id: tag.id,
      });
    }

    // ------------------------------
    // 削除処理
    // ------------------------------
    for (const name of toRemove) {
      const { data: tag } = await supabase
        .from("tag")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      if (!tag) continue;

      await supabase
        .from("saved_word_tags")
        .delete()
        .eq("saved_word_id", savedWordId)
        .eq("tag_id", tag.id);
    }

    toast.success("タグを更新しました！");
  };

  // ==============================
  // ▼ 保存・削除（ブックマークの ON/OFF）
  // ==============================
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

  // ==============================
  // ▼ 初回ロード
  // ==============================
  useEffect(() => {
    const loadSavedWords = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // words + saved_words + tags を JOIN で取ってくる想定
      const words = await fetchWordlists(user.id);

      setWordList(words);
      setSavedWords(words.map((w) => w.word));
    };

    loadSavedWords();
  }, []);

  // ==============================
  // ▼ レンダリング
  // ==============================
  return (
    <>
      <Toaster position="top-center" />

      <div className="w-full">
        {[...wordList].slice().reverse().map((item) => {
          // saved_id があればそれを優先、それ以外は word_id を使う
          // さらに prefix を付けて絶対に重複しない key にする
          const uid = item.saved_id
            ? `saved-${item.saved_id}`
            : `word-${item.word_id}`;

          return (
            <WordCard
              key={uid}
              word={item}
              savedWords={savedWords}
              onSave={handleToggleSave}
              isEditing={editingWordId === uid}
              onEdit={() => setEditingWordId(uid)}
              onFinishEdit={(tags) => {
                // saved_words にまだ保存されていない場合はタグ編集不可
                if (!item.saved_id) return;

                updateTags(item.saved_id, tags);
                setEditingWordId(null);
              }}
              allTags={allTags}
            />
          );
        })}
      </div>
    </>
  );
};

export default WordList;
