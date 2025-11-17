// src/pages/PasswordReset.tsx
import { useForm } from "react-hook-form";
import { apiRequest } from "../lib/apiClient";
import { TextInput } from "../components/TextInput";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";

interface FormData {
    email: string;
}

export default function PasswordReset() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>();

    const navigate = useNavigate();

    const onSubmit = async (data: FormData) => {
        try {
            const res = await apiRequest("/auth/password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if ("error" in res) {
                setError("email", { message: res.error });
                return;
            }

            navigate("/password/reset/sent", { state: { email: data.email } });
        } catch (err) {
            setError("email", {
                message: err instanceof Error ? err.message : "送信に失敗しました",
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
                    パスワード変更メールを送信
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
