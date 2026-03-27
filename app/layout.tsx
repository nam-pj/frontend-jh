import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-white text-black min-h-screen">
        <header className="flex items-center justify-between p-5 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-blue-600">
            My Board
          </Link>
          
          <nav className="flex gap-6 font-medium">
            <Link href="/posts" className="hover:text-blue-500 transition-colors">
              게시글 목록
            </Link>
            <Link href="/signin" className="hover:text-blue-500 transition-colors">
              로그인
            </Link>
          </nav>
        </header>

        <main className="max-w-8xl mx-auto">
          {children}
        </main>
        
      </body>
    </html>
  );
}