"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";

declare global {
  interface Window {
    Stomp: any;
  }
}

export type MessageType =
  | "TALK"
  | "GAME_INVITE"
  | "GAME_ACCEPT"
  | "GAME_DECLINE"
  | "GAME_MOVE"
  | "GAME_JOIN"
  | "ERROR";

export type ChatMessage = {
  roomId?: string | null;
  sender?: string | null;
  message?: string | null;
  receiver?: string | null;
  type?: MessageType | null;
  inviteId?: number | null;
};

const BACKEND_HTTP_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export function useChatSocket() {
  const [connected, setConnected] = useState(false);
  const [messagesByUser, setMessagesByUser] = useState<Record<string, ChatMessage[]>>({});
  const stompClientRef = useRef<any>(null);

  const myUsername =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const appendMessage = useCallback((partner: string, msg: ChatMessage) => {
    setMessagesByUser((prev) => ({
      ...prev,
      [partner]: [...(prev[partner] || []), msg],
    }));
  }, []);

  const updateInviteStatus = useCallback(
    (partner: string, inviteId: number, newType: MessageType) => {
      setMessagesByUser((prev) => ({
        ...prev,
        [partner]: (prev[partner] || []).map((m) =>
          m.type === "GAME_INVITE" && m.inviteId === inviteId
            ? { ...m, type: newType }
            : m
        ),
      }));
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (window.Stomp) {
          resolve();
          return;
        }

        const existing = document.querySelector(
          `script[src="${src}"]`
        ) as HTMLScriptElement | null;

        if (existing) {
          const timer = setInterval(() => {
            if (window.Stomp) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`스크립트 로딩 실패: ${src}`));
        document.body.appendChild(script);
      });

    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    (async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js"
      );
      if (cancelled) return;
      if (!window.Stomp) {
        console.error("STOMP 라이브러리 로딩 실패: window.Stomp가 없습니다");
        return;
      }

      const socket = new SockJS(`${BACKEND_HTTP_URL}/ws-stomp`);
      const client = window.Stomp.over(socket);
      client.debug = () => {};

      client.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          if (cancelled) return;
          setConnected(true);

          client.subscribe("/user/queue/private", (frame: any) => {
            const body: ChatMessage = JSON.parse(frame.body);

            // GAME_ACCEPT 수신 시 message 필드에서 색상 추출 후 게임 페이지 이동
            if (body.type === "GAME_ACCEPT" && body.roomId) {
              const myColor = body.message === "BLACK" ? "BLACK" : "WHITE";
              localStorage.setItem("gameColor", myColor);
              window.location.href = `/game/${body.roomId}`;
              return;
            }

            const partner =
              body.sender && body.sender !== myUsername
                ? body.sender
                : body.receiver || body.sender || "unknown";

            if (body.type === "GAME_DECLINE" && body.inviteId) {
              updateInviteStatus(partner, body.inviteId, body.type);
            }

            appendMessage(partner, body);
          });

          client.subscribe("/user/queue/errors", (frame: any) => {
            console.error("Chat error:", frame.body);
          });
        },
        () => {
          if (!cancelled) setConnected(false);
        }
      );

      stompClientRef.current = client;
    })();

    return () => {
      cancelled = true;
      stompClientRef.current?.disconnect(() => {});
      stompClientRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendTalk = useCallback(
    (receiver: string, message: string) => {
      if (!stompClientRef.current || !connected) return;
      const payload: ChatMessage = { receiver, message };
      stompClientRef.current.send(
        "/app/chat.private",
        {},
        JSON.stringify(payload)
      );
      appendMessage(receiver, {
        ...payload,
        sender: myUsername,
        type: "TALK",
      });
    },
    [connected, appendMessage, myUsername]
  );

  const sendInvite = useCallback(
    (receiver: string) => {
      if (!stompClientRef.current || !connected) return;
      const payload: ChatMessage = { receiver };
      stompClientRef.current.send(
        "/app/chat.invite",
        {},
        JSON.stringify(payload)
      );
      appendMessage(receiver, {
        sender: myUsername,
        receiver,
        type: "GAME_INVITE",
        inviteId: undefined,
      });
    },
    [connected, appendMessage, myUsername]
  );

  const respondInvite = useCallback(
    (partner: string, inviteId: number, accept: boolean) => {
      if (!stompClientRef.current || !connected) return;
      const destination = accept
        ? "/app/chat.invite.accept"
        : "/app/chat.invite.decline";
      stompClientRef.current.send(
        destination,
        {},
        JSON.stringify({ inviteId })
      );
      updateInviteStatus(
        partner,
        inviteId,
        accept ? "GAME_ACCEPT" : "GAME_DECLINE"
      );
    },
    [connected, updateInviteStatus]
  );

  return {
    connected,
    messagesByUser,
    sendTalk,
    sendInvite,
    respondInvite,
    myUsername,
  };
}