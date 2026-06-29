"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { useWebSocket } from "./WebSocketProvider";

export default function ChatWidget() {

  const [open, setOpen] = useState(false);
  const { unreadCount } = useWebSocket();

  return (
    <>
      {open && <ChatWindow />}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "70px",
          height: "70px",
          borderRadius: "9999px",
          background: "#1877F2",
          color: "white",
          border: "none",
          fontSize: "32px",
          cursor: "pointer",
          zIndex: 99999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        💬
      </button>

      {unreadCount > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "72px",
            right: "18px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: "red",
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
          }}
        >
          {unreadCount}
        </div>
      )}
    </>
  );
}