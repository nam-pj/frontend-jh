"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {

  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {

    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (token) {
      setIsLogin(true);
    }

    if (storedUserId) {
      setUserId(storedUserId);
    }

  }, []);

  const handleLogout = () => {

    // 저장 데이터 제거
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    alert("로그아웃 되었습니다.");

    window.location.href = "/";
  };

  return (
    <header className="flex items-center justify-between p-5 border-b border-gray-200">

      {/* 로고 */}
      <Link
        href="/"
        className="text-xl font-bold text-blue-600"
      >
        My Board
      </Link>

      {/* 메뉴 */}
      <nav className="flex gap-6 font-medium items-center">

        <Link
          href="/boards"
          className="hover:text-blue-500 transition-colors"
        >
          게시글 목록
        </Link>

        {/* 로그인 상태 */}
        {isLogin ? (
          <>

            {/* 마이페이지 */}
            <Link
              href={`/mypage/${userId}`}
              className="hover:text-blue-500 transition-colors"
            >
              마이페이지
            </Link>

            {/* 로그아웃 */}
            <button
              onClick={handleLogout}
              className="hover:text-red-500 transition-colors"
            >
              로그아웃
            </button>

          </>
        ) : (

          <Link
            href="/signin"
            className="hover:text-blue-500 transition-colors"
          >
            로그인
          </Link>

        )}

      </nav>

    </header>
  );
}