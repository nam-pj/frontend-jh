import type { Metadata } from "next";
import "./globals.css";

import { cookies } from "next/headers";
import Header from "@/components/Header";
import WebSocketProvider from "@/components/WebSocketProvider";
import ChatWidget from "@/components/ChatWidget";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("token")?.value;

  return (
    <html lang="ko">
      <body className="bg-white text-black min-h-screen">

        <WebSocketProvider isLoggedIn={isLoggedIn}>

          <Header />

          <main className="max-w-8xl mx-auto">
            {children}
          </main>

          {isLoggedIn && <ChatWidget />}

        </WebSocketProvider>

      </body>
    </html>
  );
}