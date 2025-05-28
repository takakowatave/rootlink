import { supabase } from './supabaseClient';
import type { WordInfo } from '../types';

export const saveWord = async (word: WordInfo): Promise<WordInfo | null> => {
  const wordToSave = { ...word };
  delete wordToSave._version;
  delete wordToSave.id;

  const { data, error } = await supabase
    .from('words')
    .insert([wordToSave])
    .select('id');

  if (error) {
    console.log("保存エラー:", error.message);
    return null;
  }

  if (data && data[0]?.id) {
    return { ...wordToSave, id: data[0].id };
  }

  return null;
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
    .match({
      word: word.word,
      pos: word.pos,
    });

  return data?.[0] ?? null;
};
