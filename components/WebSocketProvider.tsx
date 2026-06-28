"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { apiFetch } from "@/app/lib/api";

export interface DmMessage {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  type: "TALK" | "GAME_INVITE" | "GAME_ACCEPT" | "GAME_DECLINE";
  roomId?: string;
  sentAt: string;
}

interface WebSocketContextValue {
  connected: boolean;
  messages: DmMessage[];
  unreadCount: number;
  myUsername: string; // 추가
  sendDm: (receiverUsername: string, content: string, type?: DmMessage["type"], roomId?: string) => void;
  resetUnread: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket은 WebSocketProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}

export default function WebSocketProvider({
  children,
  isLoggedIn,
  myUsername,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  myUsername: string;
}) {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await apiFetch("/api/dm/unread-count");
        const count: number = await res.json();
        setUnreadCount(count);
      } catch (err: unknown) {
        console.error("안 읽은 메시지 개수 조회 실패:", err);
      }
    };

    fetchUnreadCount();

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws-stomp",
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        client.subscribe("/user/queue/dm", (message: IMessage) => {
          const body: DmMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, body]);

          // 내가 보낸 메시지 echo는 카운트 제외
          if (body.senderUsername !== myUsername) {
            setUnreadCount((prev) => prev + 1);
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [isLoggedIn, myUsername]);

  const sendDm = (
    receiverUsername: string,
    content: string,
    type: DmMessage["type"] = "TALK",
    roomId?: string
  ) => {
    clientRef.current?.publish({
      destination: "/app/dm/send",
      body: JSON.stringify({ receiverUsername, content, type, roomId }),
    });
  };

  const resetUnread = () => setUnreadCount(0);

  return (
  <WebSocketContext.Provider value={{ connected, messages, unreadCount, myUsername, sendDm, resetUnread }}>
    {children}
  </WebSocketContext.Provider>
);
}