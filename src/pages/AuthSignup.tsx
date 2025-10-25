import { useState } from "react";
import { apiRequest } from "../lib/apiClient";

export default function AuthSignup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg("登録中...");
        try {
        const res = await apiRequest("/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.error) {
            setMsg("❌ エラー: " + res.error);
        } else if (res.user) {
            setMsg("✅ 登録成功: " + res.user.email);
        } else {
            setMsg("⚠️ 不明なレスポンス");
        }
        } catch (err) {
        setMsg(err instanceof Error ? "❌ " + err.message : "サインアップに失敗しました");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80 mx-auto mt-10">
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded"
        />
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border p-2 rounded"
        />
        <button className="bg-emerald-600 text-white py-2 rounded">サインアップ</button>
        <p className="text-sm text-gray-600">{msg}</p>
        </form>
    );
}
