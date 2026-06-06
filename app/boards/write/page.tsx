"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    try {

      // localStorage 에 저장된 JWT 가져오기
      const token = localStorage.getItem("token");

      // 게시글 데이터
      const newBoard = {
        title,
        content,
      };

      // 게시글 작성 요청
      const response = await axios.post(
        "http://localhost:8080/api/boards",
        newBoard,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      alert("게시글 등록 완료!");

      // 게시글 목록으로 이동
      router.push("/boards");

    } catch (error) {
      console.error(error);

      alert("게시글 등록 실패");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-8">
        게시글 작성
      </h1>

      <div className="flex flex-col gap-5">

        {/* 제목 입력 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-xl p-4"
        />

        {/* 내용 입력 */}
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="border border-gray-300 rounded-xl p-4 resize-none"
        />

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition"
        >
          게시글 등록
        </button>

      </div>
    </div>
  );
}