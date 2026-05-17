import Link from "next/link";

export default function PostsPage() {
  const posts = [
    {
      id: 1,
      title: "첫 번째 게시글",
      content: "게시글 내용입니다.",
      author: "홍길동",
    },
    {
      id: 2,
      title: "Next.js 공부",
      content: "App Router 연습중입니다.",
      author: "김개발",
    },
    {
      id: 3,
      title: "TailwindCSS",
      content: "스타일 적용이 편하다.",
      author: "이프론트",
    },
  ];

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        게시글 목록
      </h1>

      <p className="text-gray-600 mb-8">
        등록된 게시글 페이지
      </p>

      <div className="flex flex-col gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
          >
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-gray-50 transition cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">
                {post.title}
              </h2>

              <p className="text-gray-700 mb-3">
                {post.content}
              </p>

              <span className="text-sm text-gray-400">
                작성자: {post.author}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <Link
        href="/posts/write"
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-lg transition"
      >
        게시글 작성
      </Link>
    </div>
  );
}