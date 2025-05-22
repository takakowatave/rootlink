import { AiFillFolderAdd } from 'react-icons/ai'
import { FaVolumeHigh } from "react-icons/fa6";
import type { WordInfo } from '../App' // または別で定義して共通化

type Props = {
    word: WordInfo;
    onSave?: () => void; //何かをするけど、返り値はない関数
    showAddButton?: boolean;
};

const WordCard = ({ word, showAddButton, onSave }: Props) => {
return (
    <div className="relative ...">
        {showAddButton && (
        <button onClick={onSave} className="absolute top-2 right-2 text-blue-500 hover:text-blue-600">
            <AiFillFolderAdd size={30} />
        </button>
        )}

        <div className="mt-6 ml-6">
        <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{word.word}</h2>
            <FaVolumeHigh color="grey" size={24} />
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



