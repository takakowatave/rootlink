import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from '../types';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import Tag from './Tags';

type Props = {
    word: WordInfo;
    onSave?: (word: WordInfo) => void; //何かをするけど、返り値はない関数
    label?: "main" | "synonym" | "antonym";
    savedWords: string[];
};

const WordCard = ({ word, savedWords, onSave, label}: Props) => { //isSaved = falseで初期値入れる

    if (!word.word) return null;
    const isSaved = savedWords.includes(word.word);
    const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance();
        utter.text = text;
        utter.lang = "en-GB";
        utter.rate = 0.9;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
};

return (
<div className="flex w-full">
    <div className="mb-2 md:mb-4 flex items-center w-full bg-white md:bg-gray-100">
    {label !== "main" && <div className="h-[90%] w-1 md:w-2 ml-2 md:py-2 my-4 bg-gray-200 rounded-2xl md:rounded-1xl md:mr-4" />}
        <div data-testid="word-card" className="bg-white p-4 md:rounded-2xl md:p-6 w-full">
            <div className="flex items-start justify-between ">
                <div className="flex items-center gap-2 mb-2">
                    {label && label !== "main" && <Tag type={label} data-testid={`tag-${label}`} />}
                    <h2 className="text-2xl font-bold">{word.word}</h2>
                <button onClick={() => speak(word.word)} className="text-gray-500 hover:text-gray-600 cursor-pointer transition-colors duration-150">
                    <FaVolumeHigh size={24} />
                </button>
                </div>
                <button
                    onClick={() => onSave?.(word)}
                    disabled={!isSaved && savedWords.length >= 5}
                    className="text-blue-500 hover:text-blue-900 transition-colors duration-150"
                    aria-label="save"
                >
                    {isSaved ? <BsBookmarkFill data-testid="bookmark-fill" size={24} /> : <BsBookmark size={24} />}
                </button>
            </div>
                <span className="text-s text-gray-500 mr-2">{word.pronunciation}</span>
                <p className="inline-block text-gray-600 rounded text-sm mt-1 px-2 py-0.5 border border-gray-400">{word.pos}</p>
                <p className="text-lg mt-2">{word.meaning}</p>
                <p className="mt-2 text-gray-600">
                    {word.example}
                    <button 
                        onClick={() => speak(word.example)} className="align-middle ml-1 text-gray-500 hover:text-gray-600 cursor-pointer transition-colors duration-150">
                        <FaVolumeHigh size={20} />
                    </button>
                </p>
                <p className="mt-2 text-gray-600">{word.translation}</p>
        </div>
        </div>
    </div>
);
};

export default WordCard;
