// ==============================
// WordList.tsx（タグ制限 + 重複禁止 対応版）
// ==============================

import { useState, useEffect } from "react";
import "../App.css";
import WordCard from "../components/WordCard";
import { fetchWordlists, toggleSaveStatus } from "../lib/supabaseApi";
import toast, { Toaster } from "react-hot-toast";
import type { WordInfo } from "../types";
import { supabase } from "../lib/supabaseClient";

const WordList = () => {
  // WordInfo にラベル追加
  type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };

  // 保存一覧
  const [wordList, setWordList] = useState<LabeledWord[]>([]);

  // 保存済み単語名リスト
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // 現在編集中の単語 ID
  const [editingWordId, setEditingWordId] = useState<string | null>(null);

  // react-select 用の全タグ一覧
  const [allTags, setAllTags] = useState<string[]>([]);

  // ------------------------------
  // ▼ Supabaseから全タグを取得
  // ------------------------------
  useEffect(() => {
    const loadAllTags = async () => {
      const { data } = await supabase.from("tag").select("name");
      setAllTags(data?.map((t) => t.name) ?? []);
    };
    loadAllTags();
  }, []);

  // ==============================
  // ▼ タグ更新処理（中間テーブルを変更）
  // ==============================
  const updateTags = async (savedWordId: string, tags: string[]) => {
    type ExistingLink = {
      tag_id: string;
      tag: { name: string } | null;
    };

    const { data } = await supabase
      .from("saved_word_tags")
      .select(`
        tag_id,
        tag:tag_id ( name )
      `)
      .eq("saved_word_id", savedWordId);

    const existingLinks = data as ExistingLink[] | null;

    // 既存タグ名
    const existingTagNames =
      existingLinks?.map((row) => row.tag?.name ?? "") ?? [];

    // 追加・削除の差分
    const toAdd = tags.filter((t) => !existingTagNames.includes(t));
    const toRemove = existingTagNames.filter((t) => !tags.includes(t));

    // ------------------------------
    // ▼ 追加処理
    // ------------------------------
    for (const name of toAdd) {
      let { data: tag } = await supabase
        .from("tag")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      // タグが存在しなければ作成
      if (!tag) {
        const { data: newTag } = await supabase
          .from("tag")
          .insert({ name })
          .select()
          .maybeSingle();
        tag = newTag;
      }

      // 中間テーブルに追加
      await supabase.from("saved_word_tags").insert({
        saved_word_id: savedWordId,
        tag_id: tag.id,
      });
    }

    // ------------------------------
    // ▼ 削除処理
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
  // ▼ 保存 / 削除
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
  // ▼ 初回ロード：単語 + タグ リスト取得
  // ==============================
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

  // ==============================
  // ▼ UI 描画
  // ==============================
  return (
    <>
      <Toaster position="top-center" />

      <div className="w-full">
        {[...wordList].slice().reverse().map((item) => {
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
                // 保存されていない単語はタグ不可
                if (!item.saved_id) return;

                // ==============================
                // ▼ タグ制限バリデーション
                // ==============================

                // 個数上限
                if (tags.length > 10) {
                  toast.error("タグは最大10個までです");
                  return;
                }

                // 重複禁止
                const uniqueCount = new Set(tags).size;
                if (uniqueCount !== tags.length) {
                  toast.error("同じタグは複数追加できません");
                  return;
                }

                // 文字数制限
                const tooLong = tags.find((t) => t.length > 30);
                if (tooLong) {
                  toast.error(`タグは30文字以内です：${tooLong}`);
                  return;
                }

                // DB 更新
                updateTags(item.saved_id, tags);

                // 編集終了
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
