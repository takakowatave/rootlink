import { supabase } from "./supabaseClient";
import type { WordInfo } from "../types";

/* =========================================
 ① 単語を保存（words → saved_words へ登録）
========================================= */
export const saveWord = async (word: WordInfo): Promise<boolean> => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return false;

  // ---------------------------
  // 1) dictionaryデータ（words）を upsert
  // ---------------------------
  const { data: insertedWord, error: wordErr } = await supabase
    .from("words")
    .upsert(
      {
        id: word.word_id, // すでに存在する場合はそのIDを使用
        word: word.word,
        meaning: word.meaning,
        partOfSpeech: word.partOfSpeech,
        pronunciation: word.pronunciation,
        example: word.example,
        translation: word.translation,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (wordErr || !insertedWord) {
    console.log("words 保存エラー:", wordErr?.message);
    return false;
  }

  // ---------------------------
  // 2) saved_words（ユーザーの保存単語）へ登録
  // ---------------------------
  const { error: saveErr } = await supabase
    .from("saved_words")
    .insert({
      user_id: user.id,
      word_id: insertedWord.id,
      status: "saved",
    });

  if (saveErr) {
    console.log("保存エラー:", saveErr.message);
    return false;
  }

  return true;
};

/* =========================================
 ② 単語削除（saved_words から削除）
========================================= */
export const deleteWord = async (word: WordInfo): Promise<boolean> => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return false;

  // ❗ 誤りだった: eq("word_id", word.id)
  // ✔ 正しい: saved_words.word_id は Dictionary の words.id
  const { error } = await supabase
    .from("saved_words")
    .delete()
    .eq("user_id", user.id)
    .eq("word_id", word.word_id);

  if (error) {
    console.log("削除エラー:", error.message);
    return false;
  }

  return true;
};

/* =========================================
 ③ 単語が保存済みかチェック
 ※ WordInfo | null を返す
========================================= */
export const checkIfWordExists = async (word: WordInfo): Promise<WordInfo | null> => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("saved_words")
    .select(`
      id,
      word_id,
      words!inner (
        id,
        word,
        meaning,
        partOfSpeech,
        pronunciation,
        example,
        translation
      ),
      saved_word_tags (
        tag:tag_id ( name )
      )
    `)
    .eq("user_id", user.id)
    .eq("word_id", word.word_id)
    .maybeSingle();

  if (error || !data) return null;

  const w = Array.isArray(data.words) ? data.words[0] : data.words;

  return {
    saved_id: data.id,
    word_id: data.word_id,

    word: w.word,
    meaning: w.meaning,
    example: w.example,
    translation: w.translation,
    partOfSpeech: w.partOfSpeech,
    pronunciation: w.pronunciation,

    tags: data.saved_word_tags?.map((t) => t.tag.name) ?? [],
  };
};

/* =========================================
 ④ 保存 or 削除（トグル動作）
========================================= */
export const toggleSaveStatus = async (word: WordInfo, isSaved: boolean) => {
  if (isSaved) {
    const success = await deleteWord(word);
    return { success, word };
  } else {
    const success = await saveWord(word);
    return { success, word };
  }
};

/* =========================================
 ⑤ 保存した単語一覧を取得（JOIN 完全版）
     → saved_id, word_id, tags をすべて返す
========================================= */
export const fetchWordlists = async (userId: string): Promise<WordInfo[]> => {
  const { data, error } = await supabase
    .from("saved_words")
    .select(`
      id,
      word_id,
      words!inner (
        id,
        word,
        meaning,
        partOfSpeech,
        pronunciation,
        example,
        translation
      ),
      saved_word_tags (
        tag:tag_id ( name )
      )
    `)
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => {
    const w = Array.isArray(row.words) ? row.words[0] : row.words;

    return {
      saved_id: row.id,        // saved_words.id
      word_id: row.word_id,    // words.id

      word: w.word,
      meaning: w.meaning,
      partOfSpeech: w.partOfSpeech,
      pronunciation: w.pronunciation,
      example: w.example,
      translation: w.translation,

      tags: row.saved_word_tags?.map((t) => t.tag.name) ?? [],

      label: "main",
    };
  });
};
