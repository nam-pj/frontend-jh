"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Board {
  id: number;
  title: string;
  content: string;
  username: string;
}

export default function BoardsPage() {

  const router = useRouter();

  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/boards")
      .then((response) => {
        setBoards(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // 글쓰기 버튼 클릭
  const handleWrite = () => {

    // JWT 토큰 확인
    const token = localStorage.getItem("token");

    // 로그인 안된 상태
    if (!token) {

      alert("로그인이 필요한 서비스입니다.");

      router.push("/signin");

      return;
    }

    // 로그인 된 상태
    router.push("/boards/write");
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-2">
        게시글 목록
      </h1>

      <p className="text-gray-600 mb-8">
        등록된 게시글 페이지
      </p>

      <div className="flex flex-col gap-5">

        {boards.map((post) => (

          <Link
            key={post.id}
            href={`/boards/${post.id}`}
          >
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer">

              <h2 className="text-xl font-semibold mb-2">
                {post.title}
              </h2>

              <p className="text-gray-700 mb-3">
                {post.content}
              </p>

              <span className="text-sm text-gray-400">
                작성자: {post.username}
              </span>

            </div>
          </Link>
        ))}

      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={handleWrite}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-lg transition"
      >
        게시글 작성
      </button>

    </div>
  );
}