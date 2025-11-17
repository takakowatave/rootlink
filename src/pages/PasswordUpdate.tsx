// src/pages/PasswordUpdate.tsx
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface FormData {
    password: string;
    }

    export default function PasswordUpdate() {
    const { hash } = useLocation();
    const navigate = useNavigate();

    // ハッシュ（#access_token=xxx）をパース
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>();

    if (!accessToken) {
        return <p className="text-center mt-20">無効なリンクです。</p>;
    }

    const onSubmit = async ({ password }: FormData) => {
        try {
        // ⭐ supabase にアクセストークンをセット
        const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: "", // ここは空でOK
        });

        if (sessionError) {
            setError("password", { message: "セッション設定に失敗しました。" });
            return;
        }

        // ⭐ パスワードを更新
        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            setError("password", { message: "パスワード更新に失敗しました。" });
            return;
        }

        navigate("/login", { state: { resetSuccess: true } });
        } catch (err) {
        setError("password", {
            message: err instanceof Error ? err.message : "不明なエラーです",
        });
        }
    };

    return (
        <div className="flex justify-center bg-gray-100 px-4 py-12">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
            <h1 className="text-3xl font-bold text-center text-green-700 mb-2">
            RootLink
            </h1>
            <h2 className="text-lg font-semibold text-center mb-6">
            新しいパスワードの設定
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
                type="password"
                placeholder="新しいパスワード"
                className="border p-2 rounded"
                {...register("password", {
                required: "パスワードは必須です",
                })}
            />
            {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 rounded"
            >
                {isSubmitting ? "更新中..." : "登録"}
            </button>
            </form>
        </div>
        </div>
    );
}
