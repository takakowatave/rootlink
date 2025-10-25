// src/pages/AuthLogin.tsx
import { useState } from "react";
import { apiRequest } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

export default function AuthLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsg("ログイン中...");

        try {
        const res = await apiRequest("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.error) {
            setMsg("❌ " + res.error);
        } else if (res.session) {
            // ✅ ログイン成功
            setMsg("✅ ログイン成功！");
            localStorage.setItem("access_token", res.session.access_token);
            navigate("/"); // ← ログイン後にトップページへ遷移
        } else {
            setMsg("⚠️ 不明なレスポンス");
        }
        } catch (err) {
        setMsg(err instanceof Error ? "❌ " + err.message : "ログインに失敗しました");
        }
    };

    return (
        <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-80 mx-auto mt-10"
        >
        <h2 className="text-xl font-bold text-center mb-4">ログイン</h2>
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
        <button className="bg-blue-600 text-white py-2 rounded">ログイン</button>
        <p className="text-sm text-gray-600 text-center">{msg}</p>
        </form>
    );
}
