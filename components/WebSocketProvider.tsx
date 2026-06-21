"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { apiFetch } from "@/app/lib/api";

interface DmMessage {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  sentAt: string;
}

interface WebSocketContextValue {
  connected: boolean;
  messages: DmMessage[];
  unreadCount: number;
  sendDm: (receiverUsername: string, content: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket은 WebSocketProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}

export default function WebSocketProvider({
  children,
  isLoggedIn,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
}) {

  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {

    if (!isLoggedIn) return; // 로그인 안 했으면 아예 연결 시도 안 함

    apiFetch("/api/dm/unread-count")
      .then((res) => res.json())
      .then((count: number) => setUnreadCount(count))
      .catch((err) => console.error("안 읽은 메시지 개수 조회 실패:", err));

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-stomp",
      reconnectDelay: 5000,
      onConnect: () => {

        setConnected(true);

        client.subscribe("/user/queue/dm", (message: IMessage) => {
          const body: DmMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, body]);
          setUnreadCount((prev) => prev + 1);
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };

  }, [isLoggedIn]);

  const sendDm = (receiverUsername: string, content: string) => {
    clientRef.current?.publish({
      destination: "/app/dm/send",
      body: JSON.stringify({ receiverUsername, content }),
    });
  };

  return (
    <WebSocketContext.Provider value={{ connected, messages, unreadCount, sendDm }}>
      {children}
    </WebSocketContext.Provider>
  );
}