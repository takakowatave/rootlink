// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Search from "./Search";
import WordList from "./WordList";
import AuthSignup from "./AuthSignup";
import AuthLogin from "./AuthLogin";

const App = () => {
  return (
    <Routes>
      {/* メイン機能 */}
      <Route path="/" element={<Search />} />
      <Route path="/wordlist" element={<WordList />} />

      {/* 認証ページ */}
      <Route path="/signup" element={<AuthSignup />} />
      <Route path="/login" element={<AuthLogin />} />
    </Routes>
  );
};

export default App;
