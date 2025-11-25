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

        // なければ作成
        if (!profile) {
            await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            username: user.email?.split("@")[0] ?? "",
            });
        }

        // 完了したらホームへ
        window.location.href = "/";
        };

        run();
    }, []);

    return <p>Logging in...</p>;
}
