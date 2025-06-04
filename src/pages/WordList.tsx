import { useState } from "react";
import '../App.css'
import WordCard from '../components/WordCard'
import Layout from '../components/Layout'
import { saveWord, deleteWord, checkIfWordExists } from '../lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from '../types';
import Sidebar from "../components/Sidebar";



const WordList = () => {
type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };
const [wordList, setWordList] = useState<LabeledWord[]>([]);
const [savedWords, setSavedWords] = useState<string[]>([]);

const handleToggleSave = async (word: WordInfo) => {
if (!wordList.length) return;
    const target = word;
    
if (!target.word || typeof target.word !== "string") return;
    const isSaved = savedWords.includes(target.word as string);
if (isSaved) {
    console.log("削除直前の id:", target);
    if (!target.word) return;
    const success = await deleteWord(target);

    if (success) {
    toast.success("保存を取り消しました");
    setSavedWords(savedWords.filter(w => w !== target.word)); 
    } else {
    toast.error("削除に失敗しました");
    }
} else {
    console.log("保存前のwordList:", wordList);

    const saved = await saveWord(target);
    
    if (saved?.id) {
    setSavedWords([...savedWords, target.word]);
    setWordList(prev =>
        prev.map(w => w.word === saved.word ? { ...saved, label: w.label } : w)
    )

    toast.success("保存しました");
    } else {
    const existing = await checkIfWordExists(target);
    if (existing) {
        setWordList([existing]);
        setSavedWords(savedWords.filter(w => w !== target.word));
        } 
    }
}
};

const mainWord = wordList.find(w => w.label === "main");

return (
    <>
    <Toaster position="top-center" />
    <Layout
        sidebar={
            <Sidebar
            title={"単語を検索して\n追加しよう"}
            imageSrc="/search.png"
            buttonText="単語を検索"
            linkTo="/Search"
            />
        }
        >
        {mainWord && (
        <WordCard
            word={mainWord}
            label="main"
            savedWords={savedWords}
            onSave={handleToggleSave}
        />
        )}
        <div>
        </div>
    </Layout>
    </>
);
}


export default WordList;

