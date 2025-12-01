// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
    useEffect(() => {
        const run = async () => {
        // 現在のログインユーザー取得
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // profiles にレコードがあるか確認
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // なければ作成（Google認証の情報を使用）
        if (!profile) {
            // Google認証の情報を取得
            const googleName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "";
            const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

            await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            username: googleName,
            avatar_url: googleAvatar,
            });
        } else {
            // 既存プロフィールがある場合、Google認証の情報で更新（空欄の場合のみ）
            const googleName = user.user_metadata?.full_name || user.user_metadata?.name || null;
            const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

            const updates: { username?: string; avatar_url?: string } = {};
            if (!profile.username && googleName) {
                updates.username = googleName;
            }
            if (!profile.avatar_url && googleAvatar) {
                updates.avatar_url = googleAvatar;
            }

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from("profiles")
                    .update(updates)
                    .eq("id", user.id);
            }
        }

        // 完了したらホームへ
        window.location.href = "/";
        };

        run();
    }, []);

    return <p>Logging in...</p>;
}
