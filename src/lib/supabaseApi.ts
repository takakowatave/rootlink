import { supabase } from './supabaseClient';
import type { WordInfo } from '../types';

export const saveWord = async (word: WordInfo): Promise<WordInfo | null> => {
  const wordToSave = { ...word };
  delete (wordToSave as Record<string, unknown>).label;
  const { data, error } = await supabase
    .from('words')
    .insert([wordToSave])
    .select()
    .single();

  if (error) {
    console.log("保存エラー:", error.message);
    return null;
  }

  if (data?.id) {
    return { ...wordToSave, id: data.id };
  }

  return data;
};

export const deleteWord = async (word: WordInfo): Promise<boolean> => {
  if (!word.id) return false;

  console.log("削除対象の ID:", word.id); // ← これで確認もOK

  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', word.id);

  if (error) {
    console.log("削除エラー:", error.message);
    return false;
  }

  return true;
};

export const checkIfWordExists = async (word: WordInfo): Promise<WordInfo | null> => {
  const { data } = await supabase 
    .from('words')
    .select('*')
    .eq('word', word.word)

  return data?.[0] ?? null; 
};

// 保存 or 削除を実行する関数
  //word: 何を保存 or 削除するか
  //isSaved: 保存状態をもとにどっちの処理をするかを決める
export const toggleSaveStatus = async (word: WordInfo, isSaved: boolean) => {
  if (isSaved) {
    const existing = await checkIfWordExists(word);
    if (!existing) {
      return { success: false, word };
    }
    const success = await deleteWord(existing);
    return { success, word };
  } else {
    const existing = await checkIfWordExists(word);
    if (existing) {
      return { success: false, word };
    }
    const save = await saveWord(word);
    return {
      success: !!save,
      word: save ?? word,
    };
  }
};

