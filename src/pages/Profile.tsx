import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
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
        .single();

      if (!error) setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <p className="mt-20 text-center">読み込み中...</p>;
  if (!profile) return <p className="mt-20 text-center">プロフィールが見つかりません。</p>;

  return (
    <div className="flex justify-center bg-gray-100 px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">

        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          RootLink
        </h1>
        <h2 className="text-xl font-semibold mb-6">プロフィール</h2>

        <div className="flex items-center gap-6 mb-8">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="avatar"
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <p className="text-sm text-gray-500">表示される名前</p>
            <p className="text-lg font-medium">{profile.username}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">メールアドレス</p>
          <p className="text-lg">{profile.email}</p>
        </div>

      </div>
    </div>
  );
}
