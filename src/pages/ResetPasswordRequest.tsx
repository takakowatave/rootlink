// src/pages/ResetPasswordRequest.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiRequest } from "../lib/apiClient";
import Button from "../components/button";
import { TextInput } from "../components/TextInput";

export default function ResetPasswordRequest() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<{ email: string }>();

    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const onSubmit = async ({ email }: { email: string }) => {
        try {
            const res = await apiRequest("/auth/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.error) {
                setError("email", { message: res.error });
                return;
            }

            // UI切り替えに必要
            setEmail(email);
            setSent(true);

        } catch (err) {
            setError("email", {
                message: err instanceof Error ? err.message : "送信に失敗しました。",
            });
        }
    };

    return (
        <div className="flex justify-center bg-gray-100 px-4 py-12">
            <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-green-700 mb-2">
                    RootLink
                </h1>

                {/* --- タイトル --- */}
                <h2 className="text-lg font-semibold text-center mb-6">
                    パスワード変更メールを送信
                </h2>

                {sent ? (
                    <>
                        {/* ✔ 完了メッセージ（Figma通り） */}
                        <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded mb-4">
                            <span className="text-xl">✔</span>
                            <span>パスワード変更用メールを送信しました</span>
                        </div>

                        {/* メールアドレス表示 */}
                        <p className="text-sm text-gray-600 mb-1">メールアドレス</p>
                        <div className="border rounded bg-gray-50 p-2 text-gray-800 text-sm mb-4">
                            {email}
                        </div>

                        <p className="text-center text-sm text-gray-500">
                            認証メールを開いてパスワードを再設定してください。
                        </p>
                    </>
                ) : (
                    // --- 送信前フォーム ---
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <TextInput
                            label="メールアドレス"
                            type="email"
                            error={errors.email}
                            {...register("email", { required: "メールアドレスは必須です" })}
                        />

                        <Button
                            type="submit"
                            text={isSubmitting ? "送信中..." : "送信"}
                            disabled={isSubmitting}
                        />
                    </form>
                )}
            </div>
        </div>
    );
}
