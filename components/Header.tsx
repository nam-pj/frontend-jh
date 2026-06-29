import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "./LogoutButton";

export default async function Header() {

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const username = cookieStore.get("username")?.value;

  const isLogin = !!token;

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
              href={`/mypage/${username}`}
              className="hover:text-blue-500 transition-colors"
            >
              마이페이지
            </Link>

            {/* 로그아웃 */}
            <LogoutButton />

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