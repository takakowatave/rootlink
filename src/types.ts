// types.ts
export type PartOfSpeech =
    | 'noun' | 'verb' | 'adjective' | 'adverb'
    | 'adjectival_noun' | 'pronoun' | 'preposition'
    | 'conjunction' | 'interjection' | 'particle'
    | 'auxiliary' | 'article';

export type WordInfo = {
  id?: string;         // ← これを追加（単語の主キー）
  user_id?: string;    // ← これも追加（SupabaseユーザーID）
  word: string;
  meaning: string;
  partOfSpeech?: string[];
  pronunciation?: string;
  example?: string;
  translation?: string;
  // ほかに使ってるフィールドがあればそのままでOK
};
