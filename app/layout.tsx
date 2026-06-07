import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ko">
      <body className="bg-white text-black min-h-screen">

        <Header />

        <main className="max-w-8xl mx-auto">
          {children}
        </main>

      </body>
    </html>
  );
}