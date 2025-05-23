import { supabase } from './supabaseClient'
import type { WordInfo } from '../App'; // または正しいパスに合わせる


export const saveWord = async (word: WordInfo): Promise<boolean> => {
    const { error } = await supabase
        .from('words')
        .insert([
            {
            word: word.word,
            meaning: word.meaning,
            pos: word.pos,
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
        .match({
        word: word.word,
        meaning: word.meaning,
        pos: word.pos,
        })

    return !error;
    }

    

