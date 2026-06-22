"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token"); // 실제 키 이름으로 바꿔줘
    setIsLoggedIn(!!token);
  }, []);

  if (!isLoggedIn) return null;

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
    </>
  );
}