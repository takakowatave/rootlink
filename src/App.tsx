import { useState } from "react";
import './App.css'
import Header from './components/Header'
import { AiFillFolderAdd } from 'react-icons/ai'
import { FaVolumeHigh } from "react-icons/fa6";

export default function App() {
  const [input, setInput] = useState("");

  return (
    <>
      <Header />
    <div className="min-h-screen bg-gray-100 flex items-start justify-center pt-12">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">英単語検索</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="検索ワードを入力"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            検索
          </button>
        </div>
        <div className="relative bg-white rounded px-3 p-4 border border-gray-200 mt-6 w-full max-w-xl">
          <button className="absolute top-2 right-2 text-blue-500 hover:text-blue-600">
            <AiFillFolderAdd size={28} />
          </button>
          <div className="flex items-center flex-wrap gap-4 mb-2">            
            <h2 className="text-2xl font-bold">quaint</h2>
            <FaVolumeHigh size={24}/>
            <span className="text-s text-gray-500">/kwent/</span>
            <span className="inline-block text-gray-600 rounded text-sm mt-1 px-2 py-0.4 border border-gray-400">
              adj
            </span>
          </div>
          <p className="text-lg mt-2">趣のある、古風で魅力的な</p>
          <div className="mt-6 ml-6">
            <p className="mt-2">その町には趣のある店がたくさんあります。</p>
            <p className="mt-2">The town is full of quaint shops.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
