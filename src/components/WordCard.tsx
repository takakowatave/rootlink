import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from '../types';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import Tag from './Tag';

type Props = {
    word: WordInfo;
    onSave?: () => void; //何かをするけど、返り値はない関数
    isSaved?: boolean;
    label?: "synonym" | "antonym";
};

const WordCard = ({ word, onSave, isSaved = false }: Props) => {
console.log("WordCard描画", isSaved)

const speak = () => {
    const utter = new SpeechSynthesisUtterance(word.word);
    utter.lang = "en-UK";
    speechSynthesis.speak(utter);
    utter.text = word.word + " "; 
    speechSynthesis.cancel();
    utter.rate = 0.9
};

return (
<div className="mb-2">
    <div className="mb-2">
        <div className="mt-6 ml-6">
            <div className="mt-2 flex items-start justify-between ">
                <div className="flex items-center gap-2 mb-2">
                        {label && <Tag type={label} />}
                    <h2 className="text-2xl font-bold">{word.word}</h2>
                <button onClick={speak} className="text-gray-500 hover:text-gray-600 cursor-pointer transition-colors duration-150">
                    <FaVolumeHigh size={24} />
                </button>
                </div>
                <button
                    onClick={onSave}
                    className="text-blue-500 hover:text-blue-900 transition-colors duration-150"
                >
                    {isSaved ? <BsBookmarkFill size={24} /> : <BsBookmark size={24} />}
                </button>
            </div>
                <span className="text-s text-gray-500 mr-2">{word.pronunciation}</span>
                <p className="inline-block text-gray-600 rounded text-sm mt-1 px-2 py-0.5 border border-gray-400">{word.pos}</p>
                <p className="text-lg mt-2">{word.meaning}</p>
                <p className="mt-2 text-gray-600">{word.example}</p>
                <p className="mt-2 text-gray-600">{word.translation}</p>
        </div>
        </div>
    </div>
);
};

export default WordCard;



