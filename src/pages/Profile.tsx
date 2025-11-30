import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import type { Profile } from "../types/Profile";   // ← any禁止

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single<Profile>(); // ← 型を指定して any 回避

      if (!error && data) setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <p className="mt-20 text-center">読み込み中...</p>;
  if (!profile) return <p className="mt-20 text-center">プロフィールが見つかりません。</p>;

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen px-4 py-10">
      <div className="bg-white shadow-sm rounded-2xl p-10 w-full max-w-3xl">

        <h2 className="text-2xl font-semibold mb-6">プロフィール</h2>

        {/* --- 名前セクション --- */}
        <section className="flex items-center gap-6 mb-10">
          <FaUserCircle className="w-20 h-20 text-gray-300" />

          <div className="flex-1">
            <p className="text-sm text-gray-500">表示される名前</p>
            <p className="text-lg font-medium">
              {profile.username ?? "未設定"}
            </p>
          </div>

          <button className="px-4 py-1 text-blue-500 border border-blue-400 rounded-full text-sm">
            編集
          </button>
        </section>

        <hr className="mb-10" />

        {/* --- メールアドレス --- */}
        <section className="mb-8">
          <p className="text-sm text-gray-500">メールアドレス</p>
          <div className="flex items-center justify-between">
            <p className="text-lg">{profile.email}</p>

            <button className="px-4 py-1 text-blue-500 border border-blue-400 rounded-full text-sm">
              編集
            </button>
          </div>
        </section>

        {/* --- パスワード --- */}
        <section className="mb-10">
          <p className="text-sm text-gray-500">パスワード</p>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">アカウントにログインするためのパスワード</p>

            <Link to="/password/update">
              <button className="px-4 py-1 text-blue-500 border border-blue-400 rounded-full text-sm">
                編集
              </button>
            </Link>
          </div>
        </section>

        {/* --- ログアウト --- */}
        <button
          className="flex items-center gap-2 text-left text-gray-700 hover:text-black transition"
          onClick={() => supabase.auth.signOut()}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
