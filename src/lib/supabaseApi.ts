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
  const { data } = await supabase //dataってなに
    .from('words') //wordsはWordInfoだよね
    .select('*') //これは全部チェックするってこと？
    .eq('word', word.word) //品詞含むかチェック

  return data?.[0] ?? null; //配列の一個め？ここがおかしい？
};
