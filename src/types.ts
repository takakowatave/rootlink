export type WordInfo = {
    word: string;
    meaning: string;
    pos: string[];
    pronunciation: string;
    example: string;
    translation: string;
    _version?: number; // ← UI再描画用に一時追加
    _saved?: boolean; // ← これを追加！
    id?: string; // ← これを追加！
    
};
