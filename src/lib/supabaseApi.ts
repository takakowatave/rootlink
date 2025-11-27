import { supabase } from './supabaseClient';
import type { WordInfo } from '../types';

/* =========================================
   ① 単語を保存（saved_words に保存）
========================================= */
export const saveWord = async (word: WordInfo): Promise<boolean> => {
  const res = await supabase.auth.getUser();
  const user = res.data.user;
  if (!user) return false;

  const { error } = await supabase
    .from("saved_words")
    .insert({
      user_id: user.id,
      word_id: word.id,
      status: "saved",
    });

  if (error) {
    console.log("保存エラー:", error.message);
    return false;
  }

  return true;
};

/* =========================================
   ② 単語削除（saved_words から削除）
========================================= */
export const deleteWord = async (word: WordInfo): Promise<boolean> => {
  const res = await supabase.auth.getUser();
  const user = res.data.user;
  if (!user) return false;

  const { error } = await supabase
    .from("saved_words")
    .delete()
    .eq("user_id", user.id)
    .eq("word_id", word.id);

  if (error) {
    console.log("削除エラー:", error.message);
    return false;
  }

  return true;
};

/* =========================================
   ③ 該当単語が保存されているか確認
   ❌ BEFORE: boolean を返していた
   ✔ AFTER: WordInfo | null を返すように修正
========================================= */
export const checkIfWordExists = async (word: WordInfo): Promise<WordInfo | null> => {
  const res = await supabase.auth.getUser();
  const user = res.data.user;
  if (!user) return null;   // ← 修正: boolean → null

  const { data } = await supabase
    .from("saved_words")
    .select(`
      word_id,
      words!inner (
        id,
        word,
        meaning,
        partOfSpeech,
        pronunciation,
        example,
        translation
      )
    `)
    .eq("user_id", user.id)
    .eq("word_id", word.id)
    .maybeSingle();

  if (!data) return null;   // ← 修正: boolean → null

  // ← 修正: 配列の可能性も考慮して単体を返す
  const w = Array.isArray(data.words) ? data.words[0] : data.words;

  return w ?? null;
};

/* =========================================
   ④ 保存 or 削除（トグル）
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
   ⑤ 保存した単語一覧を取得（JOIN）
========================================= */
export const fetchWordlists = async (userId: string): Promise<WordInfo[]> => {
  const { data, error } = await supabase
    .from("saved_words")
    .select(`
      word_id,
      words!inner (
        id,
        word,
        meaning,
        partOfSpeech,
        pronunciation,
        example,
        translation
      )
    `)
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => {
    // 🔥 配列でも単体でも確実に単数にする
    const w = Array.isArray(row.words) ? row.words[0] : row.words;

    return {
      ...w,
      label: "main",
    };
  });
};
