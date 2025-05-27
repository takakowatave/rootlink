import { supabase } from './supabaseClient'
import type { WordInfo } from '../types';


export const saveWord = async (word: WordInfo): Promise<WordInfo | null> => {

const { data, error } = await supabase
    .from('words')
    .upsert([word], { onConflict: 'word,pos' })
    .select('id');

    if (error) {
    console.log("保存エラー:", error.message);
    }

    if (data && data.length > 0) {
        word.id = data[0].id;
        return word;
    }

    return null;
};


export const deleteWord = async (word: WordInfo): Promise<boolean> => {
    console.log('削除対象の条件', {
        word: word.word,
        id: word.id, // ← これを追加して id の有無を確認
    });

    const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', word.id);

    if (error) {
    console.log("削除エラー:", error.message); // errorがnullじゃないときだけアクセス
    }

    return !error;
    }

export const checkIfWordExists = async (word: WordInfo) => {
    const { data } = await supabase
        .from('words')
        .select('id') // id だけでOK
        .match({
        word: word.word,
        pos: word.pos
        });

    return data && data.length > 0;
};
