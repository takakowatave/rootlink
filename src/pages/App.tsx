// src/App.tsx
import { Routes, Route } from "react-router-dom";

import Search from "./Search";
import WordList from "./WordList";
import AuthSignup from "./AuthSignup";
import AuthLogin from "./AuthLogin";
import Profile from "./Profile";

// ← 実際に存在しているファイル名に合わせる
import ResetPasswordRequest from "./ResetPasswordRequest"; 
import PasswordReset from "./PasswordReset";
import PasswordUpdate from "./PasswordUpdate";

const App = () => {
  return (
    <Routes>
      {/* メイン */}
      <Route path="/" element={<Search />} />
      <Route path="/wordlist" element={<WordList />} />

      {/* 認証 */}
      <Route path="/signup" element={<AuthSignup />} />
      <Route path="/login" element={<AuthLogin />} />

      {/* パスワード関連 */}
      <Route path="/password/request" element={<ResetPasswordRequest />} />
      <Route path="/password/reset" element={<PasswordReset />} />
      <Route path="/password/update" element={<PasswordUpdate />} />

      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default App;
