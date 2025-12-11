// ==============================
// WordCard.tsx（タグ完全対応 + 制限 + 重複禁止）
// ==============================

import { useState, useEffect } from "react";
import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from "../types";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import Tag from "./Tags";
import { normalizePOS, POS_LABEL_JA } from "../lib/pos";
import CreatableSelect from "react-select/creatable";

// ▼ react-select の型（タグ用）
type TagOption = { label: string; value: string };

type Props = {
    word: WordInfo;
    onSave?: (word: WordInfo) => void;
    label?: "main" | "synonym" | "antonym";
    savedWords: string[];
    isEditing?: boolean;
    onEdit?: () => void;
    onFinishEdit?: (tags: string[]) => void;
    allTags?: string[];
    };

    const MAX_TAGS = 10;       // タグの最大個数
    const MAX_TAG_LENGTH = 30; // タグ1つの最大文字数

    const WordCard = ({
    word,
    savedWords,
    onSave,
    label,
    isEditing,
    onEdit,
    onFinishEdit,
    allTags = [],
    }: Props) => {

    // ▼ この単語が保存済みか
    const isSaved = savedWords.includes(word.word);

    // ▼ 品詞
    const posList = normalizePOS(word.partOfSpeech ?? []);

    // ▼ タグの編集用ローカル state
    const [localTags, setLocalTags] = useState<TagOption[]>(
        word.tags?.map((t) => ({ label: t, value: t })) ?? []
    );

    // ▼ 親から word.tags が更新されたとき同期
    useEffect(() => {
        setLocalTags(word.tags?.map((t) => ({ label: t, value: t })) ?? []);
    }, [word.tags]);

    // ▼ 単語が無効なら描画しない
    if (!word?.word) return null;

    // ▼ 通常表示用のタグは localTags（＝常に最新）
    const displayTags = localTags.map((t) => t.value);

    // ==============================
    // ▼ タグ変更時のバリデーション（重複禁止・個数上限・文字数）
    // ==============================
    const handleTagChange = (newValue: readonly TagOption[]) => {
        // 上限10個
        if (newValue.length > MAX_TAGS) {
        alert(`タグは最大 ${MAX_TAGS} 個までです`);
        return;
        }

        // 重複禁止
        const values = newValue.map((t) => t.value.trim());
        const isDuplicate = values.length !== new Set(values).size;
        if (isDuplicate) {
        alert("同じタグを重複して追加することはできません");
        return;
        }

        // 文字数制限
        const tooLong = newValue.find((t) => t.value.length > MAX_TAG_LENGTH);
        if (tooLong) {
        alert(`タグは最大 ${MAX_TAG_LENGTH} 文字までです：${tooLong.value}`);
        return;
        }

        // OKなら反映
        setLocalTags([...newValue]);
    };

    // ▼ 発音機能
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
            <div className="bg-white p-4 md:rounded-2xl md:p-6 w-full">
            {/* HEADER */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                {/* synonym / antonym のラベル */}
                {label && label !== "main" && (
                    <Tag type={label} data-testid={`tag-${label}`} />
                )}

                {/* 単語 */}
                <h2 className="text-2xl font-bold">{word.word}</h2>

                {/* 発音ボタン */}
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
                disabled={!isSaved && savedWords.length >= 500}
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

            {/* 品詞ピル */}
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

            {/* 日本語訳 */}
            <p className="mt-2 text-gray-600">{word.translation}</p>

            {/* ============================== */}
            {/* ▼ 通常モード（タグ表示） */}
            {/* ============================== */}
            {!isEditing && (
                <div className="mt-3 flex items-start justify-between w-full">
                <div className="flex flex-wrap gap-2 w-full max-w-[90%]">
                    {displayTags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                        {tag}
                    </span>
                    ))}
                </div>

                {/* 編集ボタン */}
                {onEdit && (
                    <button
                    onClick={onEdit}
                    className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                    ✏️
                    </button>
                )}
                </div>
            )}

            {/* ============================== */}
            {/* ▼ 編集モード（タグ編集UI） */}
            {/* ============================== */}
            {isEditing && (
                <div className="mt-3">
                <CreatableSelect<TagOption, true>
                    isMulti
                    value={localTags}
                    options={allTags.map((t) => ({ label: t, value: t }))}
                    onChange={handleTagChange}
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
