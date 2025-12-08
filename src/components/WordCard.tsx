// ==============================
// WordCard.tsx
// ==============================

import { useState, useEffect } from "react";
import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from "../types";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import Tag from "./Tags";
import { normalizePOS, POS_LABEL_JA } from "../lib/pos";
import CreatableSelect from "react-select/creatable";

type Props = {
    word: WordInfo;
    onSave?: (word: WordInfo) => void;
    label?: "main" | "synonym" | "antonym";
    savedWords: string[];
    isEditing?: boolean;
    onEdit?: () => void;
    onFinishEdit?: (tags: string[]) => void;
    allTags?: string[];   // ← ★これを追加！
    };

    const WordCard = ({
    word,
    savedWords,
    onSave,
    label,
    isEditing,
    onEdit,
    onFinishEdit,
    allTags=[],   // ← ★ これを追加！！
    }: Props) => {

    // 保存済みかどうか（label とは無関係）
    const isSaved = savedWords.includes(word.word);

    // 品詞
    const posList = normalizePOS(word.partOfSpeech ?? []);

    // タグ編集用ローカル状態
    const [localTags, setLocalTags] = useState(
        word.tags?.map((t) => ({ label: t, value: t })) ?? []
    );

    // 親から渡ってくる tags が変わったら同期
    useEffect(() => {
        setLocalTags(word.tags?.map((t) => ({ label: t, value: t })) ?? []);
    }, [word.tags]);
    
    // データがないときは何も描画しない
    if (!word?.word) return null;
    // 通常表示用のタグ（word.tags が優先）
    const displayTags = word.tags ?? localTags.map((t) => t.value);

    // 発音
    const speak = (text: string) => {
        if (!text) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-GB";
        utter.rate = 0.9;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    };

    return (
        <div className="flex w-full relative">
        <div className="mb-2 md:mb-4 flex items-center w-full bg-white md:bg-gray-100">
            {/* --- 単語カード本体 --- */}
            <div
            data-testid="word-card"
            className="bg-white p-4 md:rounded-2xl md:p-6 w-full"
            >
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                {label && label !== "main" && (
                    <Tag type={label} data-testid={`tag-${label}`} />
                )}

                <h2 className="text-2xl font-bold">{word.word}</h2>

                <button
                    onClick={() => speak(word.word)}
                    className="text-gray-500 hover:text-gray-600 transition-colors"
                >
                    <FaVolumeHigh size={24} />
                </button>
                </div>

                {/* 保存ボタン */}
                <button
                onClick={() => onSave?.(word)}
                disabled={!isSaved && savedWords.length >= 5}
                className="text-blue-500 hover:text-blue-900 transition-colors"
                aria-label="save"
                >
                {isSaved ? (
                    <BsBookmarkFill data-testid="bookmark-fill" size={24} />
                ) : (
                    <BsBookmark size={24} />
                )}
                </button>
            </div>

            {/* 発音記号 */}
            <span className="text-s text-gray-500 mr-2">
                {word.pronunciation}
            </span>

            {/* 品詞 */}
            <div className="flex flex-wrap gap-1 mt-1">
                {posList.map((pos) => (
                <span
                    key={pos}
                    className="inline-block text-gray-700 rounded text-xs px-2 py-0.5 border bg-gray-50"
                >
                    {POS_LABEL_JA[pos]}
                </span>
                ))}
            </div>

            {/* 意味 */}
            <p className="text-lg mt-2">{word.meaning}</p>

            {/* 例文 */}
            <p className="mt-2 text-gray-600">
                {word.example}
                <button
                onClick={() => speak(word.example ?? "")}
                className="align-middle ml-1 text-gray-500 hover:text-gray-600"
                >
                <FaVolumeHigh size={20} />
                </button>
            </p>

            {/* 訳 */}
            <p className="mt-2 text-gray-600">{word.translation}</p>

            {/* ▼ 通常モード：タグピル＋✏️ */}
            {!isEditing && (
                <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                        {tag}
                    </span>
                    ))}
                </div>

                {onEdit && (
                    <button
                    onClick={onEdit}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                    ✏️
                    </button>
                )}
                </div>
            )}

            {/* ▼ 編集モード：React-Select＋保存 */}
            {isEditing && (
                <div className="mt-3">
                <CreatableSelect
                    isMulti
                    value={localTags}
                    options={allTags.map((t) => ({ label: t, value: t }))} // ★追加
                    onChange={(newValue) => setLocalTags([...newValue])}
                    placeholder="タグを入力"
                    className="react-select-container"
                    classNamePrefix="react-select"
                />

                <button
                    onClick={() =>
                    onFinishEdit?.(localTags.map((t) => t.value))
                    }
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                >
                    保存
                </button>
                </div>
            )}
            </div>
        </div>
        </div>
    );
};

export default WordCard;
