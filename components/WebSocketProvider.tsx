"use client";

import { useEffect } from "react";

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) return;

    console.log("웹소켓 연결");

    return () => {
      console.log("웹소켓 종료");
    };

  }, []);

  return <>{children}</>;
}

/*
"use client";

import { useEffect } from "react";

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. 백엔드 웹소켓 서버에 연결
    const ws = new WebSocket(`ws://백엔드주소/ws?token=${token}`);

    // 2. 연결 성공
    ws.onopen = () => {
      console.log("웹소켓 연결됨");
    };

    // 3. 백엔드에서 메시지 수신
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("받은 메시지:", data);
    };

    // 4. 에러
    ws.onerror = (error) => {
      console.error("웹소켓 에러:", error);
    };

    // 5. 연결 종료 (페이지 이탈 시 자동 정리)
    return () => {
      ws.close();
      console.log("웹소켓 종료");
    };
  }, []);

  return <>{children}</>;
}
  */