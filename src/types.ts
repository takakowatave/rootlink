// types.ts
export type PartOfSpeech =
    | 'noun' | 'verb' | 'adjective' | 'adverb'
    | 'adjectival_noun' | 'pronoun' | 'preposition'
    | 'conjunction' | 'interjection' | 'particle'
    | 'auxiliary' | 'article';

    export type WordInfo = {
      saved_id: string | null;   // ← saved_words.id（タグ保存用）
      word_id: string;           // ← words.id（辞書用）
    
      word: string;
      meaning: string;
      partOfSpeech?: string[];
      pronunciation?: string;
      example?: string;
      translation?: string;
    
      tags?: string[];
    };
    