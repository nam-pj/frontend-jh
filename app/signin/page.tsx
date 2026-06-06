"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:8080/user/login",
        {
          username,
          password,
        }
      );

      // 응답 데이터
      const token = response.data.token;
      const userId = response.data.userId;

      // localStorage 저장
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      alert("로그인 성공");

      // 새로고침 이동
      window.location.href = "/boards";

    } catch (error) {

      console.error(error);

      alert("로그인 실패");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-5"
      >

        <h1 className="text-2xl font-bold text-center">
          로그인
        </h1>

        {/* 아이디 */}
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          로그인
        </button>

        {/* 회원가입 이동 */}
        <Link
          href="/signup"
          className="text-center text-sm text-gray-500 hover:text-blue-500"
        >
          계정이 없나요? 회원가입
        </Link>

      </form>

    </div>
  );
}