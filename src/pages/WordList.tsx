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
  // ① ログイン中ユーザー取得
  const res = await supabase.auth.getUser();
  const currentUser = res.data.user;
  if (!currentUser) {
    toast.error("ログインが必要です");
    return;
  }

  // ② 現状の保存単語を取得（user_id で絞る）
  const currentWords = await fetchWordlists(currentUser.id);

  // ③ すでに保存されているか？
  const isSaved = currentWords.some(w => w.word === word.word);

  console.log("isSaved:", isSaved);
  console.log("word.word:", word.word);
  console.log("savedWords:", savedWords);

  // ④ 保存上限チェック（30単語）
  if (!isSaved && currentWords.length >= 30) {
    toast.error("保存できる単語は30個までです");
    return;
  }

  // ⑤ 保存を外す場合 → 表示中のリストからも消す
  if (isSaved) {
    setWordList(wordList.filter(w => w.word !== word.word));
  }

  // ⑥ Supabase 側で保存 or 削除
  const result = await toggleSaveStatus(word, isSaved);

  // ⑦ 成功時
  if (result.success) {
    if (isSaved) {
      toast.success("保存を取り消しました");
      setSavedWords(savedWords.filter(w => w !== word.word));
    } else {
      toast.success("保存に成功しました");
      setSavedWords([...savedWords, result.word.word]);
    }
  } else {
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

    const words = await fetchWordlists(user.id); // ← user.id を渡す
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


