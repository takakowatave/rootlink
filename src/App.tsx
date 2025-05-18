import { useState } from "react";
import './App.css'
import { Volume2 } from 'lucide-react';


export default function App() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
        <div className="bg-white p-4 border border-gray-200 mt-6 w-full max-w-xl">
          <div className="flex items-center justify-between">            
            <h2 className="text-xl font-bold">quaint</h2>
            <Volume2 className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-500">/kwent/</span>
          </div>
          <p className="text-green-800 text-sm mt-1">adj</p>
          <p className="mt-2">趣のある、古風で魅力的な</p>
        </div>
      </div>
    </div>
  );
}
