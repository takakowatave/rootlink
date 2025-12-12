// ==============================
// WordCard.tsx（完全版）
// ==============================

import { useState, useEffect } from "react";
import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from "../types";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import Tag from "./Tags";
import { normalizePOS, POS_LABEL_JA } from "../lib/pos";
import CreatableSelect from "react-select/creatable";

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

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

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
  // ▼ UI 表示用のブックマーク判定（savedWords を使う）
  const isBookmarked = savedWords.includes(word.word);

  // ▼ タグ編集を許可するか（saved_id がある時だけ）
  const canEditTags = Boolean(word.saved_id);

  // ▼ 品詞
  const posList = normalizePOS(word.partOfSpeech ?? []);

  // ▼ タグ編集用ローカル state
  const [localTags, setLocalTags] = useState<TagOption[]>(
    word.tags?.map((t) => ({ label: t, value: t })) ?? []
  );

  // ▼ word.tags が更新されたら同期
  useEffect(() => {
    setLocalTags(word.tags?.map((t) => ({ label: t, value: t })) ?? []);
  }, [word.tags]);

  if (!word?.word) return null;

  const displayTags = localTags.map((t) => t.value);

  // ----------------------------------------------------
  // タグ変更バリデーション（重複・個数・文字数）
  // ----------------------------------------------------
  const handleTagChange = (newValue: readonly TagOption[]) => {
    if (newValue.length > MAX_TAGS) {
      alert(`タグは最大 ${MAX_TAGS} 個までです`);
      return;
    }

    const values = newValue.map((t) => t.value.trim());
    if (values.length !== new Set(values).size) {
      alert("同じタグは複数追加できません");
      return;
    }

    const tooLong = newValue.find((t) => t.value.length > MAX_TAG_LENGTH);
    if (tooLong) {
      alert(`タグは30文字以内です：${tooLong.value}`);
      return;
    }

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

            {/* ブックマークボタン（UI 判定は savedWords ベース） */}
            <button
              onClick={() => onSave?.(word)}
              disabled={!isBookmarked && savedWords.length >= 500}
              className="text-blue-500 hover:text-blue-900 transition-colors"
              aria-label="save"
            >
              {isBookmarked ? (
                <BsBookmarkFill size={24} />
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

          {/* ----------------------------------------- */}
          {/* 通常モード（タグ表示） */}
          {/* ----------------------------------------- */}
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

              {/* 編集ボタン（saved_id がある場合のみ） */}
              {onEdit && canEditTags && (
                <button
                  onClick={onEdit}
                  className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  ✏️
                </button>
              )}
            </div>
          )}

          {/* ----------------------------------------- */}
          {/* 編集モード */}
          {/* ----------------------------------------- */}
          {isEditing && (
            <div className="mt-3">
              <CreatableSelect<TagOption, true>
                isMulti
                value={localTags}
                options={allTags.map((t) => ({ label: t, value: t }))}
                onChange={handleTagChange}
                placeholder="タグを入力"
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
