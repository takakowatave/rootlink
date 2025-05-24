import { supabase } from './supabaseClient'
import type { WordInfo } from '../types';


export const saveWord = async (word: WordInfo): Promise<boolean> => {
        console.log('match条件:', {
        word: word.word,
        meaning: word.meaning,
        pos: JSON.stringify(word.pos)
        });
        const existing = await supabase
            .from('words') // words テーブルから
            .select('id')  // id カラムだけを選んで
            .match({
            word: word.word,
            meaning: word.meaning,
            pos: JSON.stringify(word.pos),
        });
        if (existing.data && existing.data.length > 0) {
            return false;
        }
        const { error } = await supabase
            .from('words')
            .insert([
                {
                word: word.word,
                meaning: word.meaning,
                pos: JSON.stringify(word.pos),
                pronunciation: word.pronunciation,
                example: word.example,
                translation: word.translation,
                }
            ])
        .select();
    return !error;
    }

export const deleteWord = async (word: WordInfo): Promise<boolean> => {
    const { error } = await supabase
        .from('words')
        .delete()
        .eq('word', word.word)
        .eq('meaning', word.meaning)
        .eq('pos', JSON.stringify(word.pos))
    
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
        meaning: word.meaning,
        pos: JSON.stringify(word.pos),
        });

    return data && data.length > 0;
};


    

