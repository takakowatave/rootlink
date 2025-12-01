// src/components/Header.tsx
import { Link } from "react-router-dom";
import Button from "./button";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaUserCircle } from "react-icons/fa";
import type { Profile } from "../types/Profile";
import EditProfileModal from "./EditProfileModal";

const Header = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // プロフィール読み込み
    useEffect(() => {
        const load = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single<Profile>();

        if (data) setProfile(data);
        };

        load();
    }, []);

    return (
        <>
        <header className="bg-white text-black py-2 px-4 md:px-8 flex justify-between items-center">
            {/* 左：ロゴ → HOME に戻す（元に戻す） */}
            <Link to="/">
            <img src="/logo.svg" alt="logo" className="h-6 md:h-8 cursor-pointer" />
            </Link>

            {/* 右 */}
            <div className="flex items-center gap-4">
            {!profile && (
                <Link to="/login">
                <Button text="ログイン" variant="secondary" />
                </Link>
            )}

            {profile && (
                <>
                <Link to="/wordlist">
                    <Button text="単語リスト" variant="secondary" />
                </Link>

                {/* プロフィールアイコン → /profile に遷移せずモーダル */}
                <div
                    className="cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                >
                    {profile.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    ) : (
                    <FaUserCircle className="w-8 h-8 text-gray-400" />
                    )}
                </div>
                </>
            )}
            </div>
        </header>

        {/* モーダル */}
        <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            profile={profile}
            onUpdated={async () => {
            // 保存後に再取得して Header の画像も更新
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single<Profile>();
            if (data) setProfile(data);
            }}
        />
        </>
    );
    };

export default Header;
