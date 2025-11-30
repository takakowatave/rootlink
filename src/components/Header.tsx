import { Link } from "react-router-dom";
import Button from "./button";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then((res) => setUser(res.data.user));
    }, []);

    const isLoggedIn = !!user;

    return (
        <header className="bg-white text-black py-2 px-4 md:px-8 flex justify-between items-center">
        {/* 左：ロゴ */}
        <Link to="/">
            <img src="/logo.svg" alt="logo" className="h-6 md:h-8" />
        </Link>

        {/* 右側 */}
        <div className="flex items-center gap-4">
            {!isLoggedIn && (
            <Link to="/login">
                <Button text="ログイン" variant="secondary" />
            </Link>
            )}

            {isLoggedIn && (
            <>
                <Link to="/wordlist">
                <Button text="単語リスト" variant="secondary" />
                </Link>

                <Link to="/profile">
                <FaUserCircle className="w-8 h-8 text-gray-400 hover:text-gray-600 transition" />
                </Link>
            </>
            )}
        </div>
        </header>
    );
};

export default Header;
