import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

import Search from "./Search";
import WordList from "./WordList";
import Profile from "./Profile";

// 認証系（Layout なし）
import AuthLogin from "./AuthLogin";
import AuthSignup from "./AuthSignup";
import AuthCallback from "./AuthCallback";

const App = () => {
  return (
    <Routes>
      {/* Layout を使うページ */}
      <Route path="/" element={<Layout><Search /></Layout>} />
      <Route path="/wordlist" element={<Layout><WordList /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />

      {/* Layout を使わないページ */}
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/signup" element={<AuthSignup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
};

export default App;
