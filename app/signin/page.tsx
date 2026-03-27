import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="p-10 flex flex-col gap-4">
      <h1 className="text-3xl font-bold">로그인</h1>
      <p className="text-gray-600">
        로그인 페이지
      </p>

      <Link href="/signup" className="w-fit hover:text-blue-500 transition-colors">
        회원가입 페이지로 이동
        </Link>
    </div>
  );
}