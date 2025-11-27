import { Link } from "react-router-dom";
import Button from "./button";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await supabase.auth.getUser();
      console.log("HEADER USER:", res.data.user);
      setUser(res.data.user);
    };

    fetchUser();
  }, []);

  const isLoggedIn = !!user;

  return (
    <header className="bg-white text-black py-2 px-4 md:px-8 flex justify-between items-center">
      {/* 左：ロゴ */}
      <Link to="/">
        <img src="/logo.svg" alt="logo" className="h-6 md:h-8 mr-3" />
      </Link>

      {/* 右：常に1つだけ表示 */}
      {isLoggedIn ? (
        <Link to="/profile">
          <Button text="マイページ" variant="secondary" />
        </Link>
      ) : (
        <Link to="/wordlist">
          <Button text="単語リスト" variant="secondary" />
        </Link>
      )}
    </header>
  );
};

export default Header;
