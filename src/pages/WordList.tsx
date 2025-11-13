import { useState, useEffect } from "react";
import '../App.css'
import WordCard from '../components/WordCard'
import Layout from '../components/Layout'
import { fetchWordlists, toggleSaveStatus } from '../lib/supabaseApi';
import toast, { Toaster } from 'react-hot-toast';
import type { WordInfo } from '../types';
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabaseClient";


const WordList = () => {
type LabeledWord = WordInfo & { label?: "main" | "synonym" | "antonym" };
const [wordList, setWordList] = useState<LabeledWord[]>([]);
const [savedWords, setSavedWords] = useState<string[]>([]);

const handleToggleSave = async (word: WordInfo) => {
   const currentWords = await fetchWordlists(); //supabaseからデータ取得
  //単語が保存済みかどうかをチェック
    const isSaved = currentWords.some(w => w.word === word.word); //保存済みの単語と同じ文字列があるか
  console.log("isSaved:", isSaved);
  console.log("word.word:", word.word);
  console.log("savedWords:", savedWords);
  //保存の上限設定
    if (!isSaved && currentWords.length >= 30) {
        toast.error("保存できる単語は30個までです");
        return;     
    }
  // 保存が成功したらここで削除
    if (isSaved) {
      setWordList(wordList.filter(w => w.word !== word.word)); //今のリストから指定した単語を除いた配列を作る
    }

    const result = await toggleSaveStatus(word, isSaved);
    if (result.success) {
        if (isSaved) {
        toast.success("保存を取り消しました");
        setSavedWords(savedWords.filter(w => w !== word.word));
        } else {
        toast.success("保存に成功しました");
        setSavedWords([...savedWords, result.word.word]);
        }
        } else { //それぞれのエラーハンドリング
        toast.error(isSaved ? "保存の取り消しに失敗しました" : "保存に失敗しました");
        }
};

//supabaseで保存した単語をリスト表示する
useEffect(() => {
  const loadSavedWords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("ログインが必要です");
      return;
    }

    const words = await fetchWordlists();
    setWordList(words);
    setSavedWords(words.map(w => w.word));
  };

  loadSavedWords();
}, []);



return (
    <>
    <Toaster position="top-center" />
    <Layout
        sidebar={
            <Sidebar
            title={"単語を検索して\n追加しよう"}
            imageSrc="/search.png"
            buttonText="単語を検索"
            linkTo="/"
            />
        }
        >
    {[...wordList]
      .slice() // コピーして
      .reverse() // 順番を逆にする
        .map(item => (
            <WordCard
            key={item.word}
            word={item}
            // label="main"
            savedWords={savedWords}
            onSave={handleToggleSave}
            data-testid="saved-word"
        />
    ))}
        </Layout>
    </>
);
}


export default WordList;


