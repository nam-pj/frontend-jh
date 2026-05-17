"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const newPost = {
      title,
      content,
    };

    console.log(newPost);

    alert("게시글 등록 완료!");

    // 게시글 목록으로 이동
    router.push("/posts");
  };

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">
        게시글 작성
      </h1>

      <div className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-xl p-4"
        />

        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="border border-gray-300 rounded-xl p-4 resize-none"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-4 rounded-xl"
        >
          게시글 등록
        </button>
      </div>
    </div>
  );
}