// ==============================
// WordCard.tsx
// ==============================
// 各単語カード（例: atom, catch など）を表示するコンポーネント。
// 単語の詳細・発音・例文・訳・保存ボタンなどをまとめて描画します。
// ==============================

import { FaVolumeHigh } from "react-icons/fa6";                  // スピーカーアイコン（発音ボタン）
import type { WordInfo } from "../types";                       // 単語データ型
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";    // ブックマークアイコン
import Tag from "./Tags";                                       // 「関連語」「対義語」ラベル
import { normalizePOS, POS_LABEL_JA } from "../lib/pos";        // 品詞を正規化＆日本語化

type Props = {
  word: WordInfo;                    // 単語データ（例: { word, meaning, ... }）
  onSave?: (word: WordInfo) => void; // 保存ボタンを押した時の処理
  label?: "main" | "synonym" | "antonym"; // 「関連語」「対義語」など
  savedWords: string[];              // 保存済み単語リスト
};

const WordCard = ({ word, savedWords, onSave, label }: Props) => {
    // --- 1️⃣ データがない場合は表示しない ---
    if (!word?.word) return null;

    // --- 2️⃣ 保存済みかどうかチェック ---
    const isSaved = savedWords.includes(word.word) && label !== "main";


    // --- 3️⃣ 品詞（partOfSpeech）を正規化してリスト化 ---
    // 例: "verbnoun" → ["verb", "noun"]
    const posList = normalizePOS(word.partOfSpeech);

    // --- 4️⃣ 発音機能 ---
    // SpeechSynthesis API を使って、英単語や例文を音声で再生する
    const speak = (text: string) => {
        if (!text) return; // 空なら何もしない
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-GB"; // イギリス英語
        utter.rate = 0.9;     // 少しゆっくり
        speechSynthesis.cancel(); // 再生中の音声があればキャンセル
        speechSynthesis.speak(utter);
    };

    // --- 5️⃣ UI描画 ---
    return (
        <div className="flex w-full">
        <div className="mb-2 md:mb-4 flex items-center w-full bg-white md:bg-gray-100">
            
            {/* --- 左側の縦バー（synonym, antonym時のみ） --- */}
            {label !== "main" && (
            <div className="h-[90%] w-1 md:w-2 ml-2 md:py-2 my-4 bg-gray-200 rounded-2xl md:mr-4" />
            )}

            {/* --- 単語カード本体 --- */}
            <div
            data-testid="word-card"
            className="bg-white p-4 md:rounded-2xl md:p-6 w-full"
            >
            {/* --- ヘッダー部（単語＋発音＋保存ボタン） --- */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                {/* 関連語/対義語ラベル（main以外のみ） */}
                {label && label !== "main" && (
                    <Tag type={label} data-testid={`tag-${label}`} />
                )}

                {/* 単語名 */}
                <h2 className="text-2xl font-bold">{word.word}</h2>

                {/* 単語の発音ボタン */}
                <button
                    onClick={() => speak(word.word)}
                    className="text-gray-500 hover:text-gray-600 cursor-pointer transition-colors duration-150"
                >
                    <FaVolumeHigh size={24} />
                </button>
                </div>

                {/* 保存ボタン（5個まで） */}
                <button
                onClick={() => onSave?.(word)}
                disabled={!isSaved && savedWords.length >= 5}
                className="text-blue-500 hover:text-blue-900 transition-colors duration-150"
                aria-label="save"
                >
                {isSaved ? (
                    <BsBookmarkFill data-testid="bookmark-fill" size={24} />
                ) : (
                    <BsBookmark size={24} />
                )}
                </button>
            </div>

            {/* --- 発音記号 --- */}
            <span className="text-s text-gray-500 mr-2">{word.pronunciation}</span>

            {/* --- 品詞（verb, noun などをタグ化して表示） --- */}
            <div className="flex flex-wrap gap-1 mt-1">
                {posList.map((pos) => (
                <span
                    key={pos}
                    className="inline-block text-gray-700 rounded text-xs px-2 py-0.5 border border-gray-400 bg-gray-50"
                >
                    {POS_LABEL_JA[pos]} {/* 日本語化された品詞（例: 名詞 / 動詞） */}
                </span>
                ))}
            </div>

            {/* --- 意味 --- */}
            <p className="text-lg mt-2">{word.meaning}</p>

            {/* --- 例文とその音声 --- */}
            <p className="mt-2 text-gray-600">
                {word.example}
                <button
                onClick={() => speak(word.example)}
                className="align-middle ml-1 text-gray-500 hover:text-gray-600 cursor-pointer transition-colors duration-150"
                >
                <FaVolumeHigh size={20} />
                </button>
            </p>

            {/* --- 日本語訳 --- */}
            <p className="mt-2 text-gray-600">{word.translation}</p>
            </div>
        </div>
        </div>
    );
};

export default WordCard;
