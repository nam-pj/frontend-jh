import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import WebSocketProvider from "@/components/WebSocketProvider";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ko">
      <body className="bg-white text-black min-h-screen">

        <WebSocketProvider>

          <Header />

          <main className="max-w-8xl mx-auto">
            {children}
          </main>

          <ChatWidget />

        </WebSocketProvider>

      </body>
    </html>
  );
}