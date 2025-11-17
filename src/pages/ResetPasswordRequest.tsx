// src/pages/ResetPasswordRequest.tsx
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

        alert("パスワード再設定メールを送信しました ✔︎");
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
            <h2 className="text-lg font-semibold text-center mb-6">
            パスワード再設定メールを送信
            </h2>

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
        </div>
        </div>
    );
}
