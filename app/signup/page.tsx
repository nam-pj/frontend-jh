"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";

export default function SignUpPage() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordCheck) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/user",
        {
          username,
          password,
        }
      );

      console.log(response.data);

      alert("회원가입 성공!");
    } catch (err: any) {
      console.error(err);

      setError("회원가입 실패");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-center">회원가입</h1>

        <input
          type="email"
          placeholder="이메일"
          value={username}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
          required
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordCheck}
          onChange={(e) => setPasswordCheck(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-green-600 text-white p-3 rounded-lg font-semibold"
        >
          회원가입
        </button>

        <Link
          href="/signin"
          className="text-center text-sm text-gray-500"
        >
          이미 계정이 있나요? 로그인
        </Link>
      </form>
    </div>
  );
}