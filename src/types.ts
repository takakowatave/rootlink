export type WordInfo = {
    word: string;
    meaning: string;
    pos: string[];
    pronunciation: string;
    example: string;
    translation: string;
    _saved?: boolean; // ← これを追加！
    id?: string; // ← これを追加！
    
};
