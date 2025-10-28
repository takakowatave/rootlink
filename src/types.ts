// types.ts
export type PartOfSpeech =
    | 'noun' | 'verb' | 'adjective' | 'adverb'
    | 'adjectival_noun' | 'pronoun' | 'preposition'
    | 'conjunction' | 'interjection' | 'particle'
    | 'auxiliary' | 'article';

export type WordInfo = {
    word: string;
    pronunciation: string;
    partOfSpeech: PartOfSpeech[]; 
    meaning: string;
    example: string;
    translation: string;
};
