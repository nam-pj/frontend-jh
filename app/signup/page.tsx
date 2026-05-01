"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordCheck) {
    setError("비밀번호가 일치하지 않습니다.");
    return;
  }

  setError("");

    console.log({ email, password });
    // 👉 회원가입 API 호출 자리
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-center">회원가입</h1>

        {/* 이메일 */}
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* 비밀번호 */}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* 비밀번호 확인 */}
        <input
          type="password"
          placeholder="비밀번호 확인"
          value={passwordCheck}
          onChange={(e) => setPasswordCheck(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {/* 회원가입 버튼 */}
        <button
          type="submit"
          className="bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          회원가입
        </button>

        {/* 로그인 이동 */}
        <Link
          href="/signin"
          className="text-center text-sm text-gray-500 hover:text-blue-500"
        >
          이미 계정이 있나요? 로그인
        </Link>
      </form>
    </div>
  );
}