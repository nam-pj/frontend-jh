"use client";

import { useState } from "react";

export default function ChatWindow() {

  const [activeTab, setActiveTab] =
    useState<"friends" | "dm">("friends");

  const [selectedUser, setSelectedUser] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  // 채팅방 화면
  if (selectedUser) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          width: "350px",
          height: "500px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "12px",
          zIndex: 99999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: "12px",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setSelectedUser(null)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ←
          </button>

          <strong>{selectedUser}</strong>
        </div>

        {/* 메시지 영역 */}
        <div
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
          }}
        >
          <div  //s상대채팅//
            style={{
              marginBottom: "10px",
              background: "#f1f1f1",
              padding: "8px",
              borderRadius: "8px",
              width: "fit-content",
            }}
          >
            나는 바보다
          </div>

          <div //내 채팅//
            style={{
              marginLeft: "auto",
              marginBottom: "10px",
              background: "#1877F2",
              color: "white",
              padding: "8px",
              borderRadius: "8px",
              width: "fit-content",
            }}
          >
            "알아"
          </div>
        </div>

        {/* 입력창 */}
        <div
          style={{
            borderTop: "1px solid #ddd",
            padding: "10px",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지 입력"
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          <button
            style={{
              background: "#1877F2",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            전송
          </button>
        </div>
      </div>
    );
  }

  // 목록 화면
  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "20px",
        width: "350px",
        height: "500px",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "12px",
        zIndex: 99999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 탭 */}
      <div
        style={{
        display: "flex",
        padding: "10px",
        borderBottom: "1px solid #eee",
        background: "#fafafa",
        borderRadius: "12px 12px 0 0",
        overflow: "hidden",
        }}
      >
        <button
        onClick={() => setActiveTab("friends")}
        style={{
            flex: 1,
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            background: "none",
            cursor: "pointer",
            padding: "10px",
            fontWeight: activeTab === "friends" ? "bold" : "normal",
            color: activeTab === "friends" ? "#1877F2" : "#666",
            borderBottom:
            activeTab === "friends"
                ? "3px solid #1877F2"
                : "3px solid transparent",
        }}
        >
        친구
        </button>

        <button
        onClick={() => setActiveTab("dm")}
        style={{
            flex: 1,
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "10px",
            fontWeight: activeTab === "dm" ? "bold" : "normal",
            color: activeTab === "dm" ? "#1877F2" : "#666",
            borderBottom:
            activeTab === "dm"
                ? "3px solid #1877F2"
                : "3px solid transparent",
        }}
        >
        DM
        </button>
      </div>

      {/* 친구목록 */}
      {activeTab === "friends" && (
        <div style={{ flex: 1 }}>
          {["이승훈", "현지훈",].map((user) => (
            <div
              key={user}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: "14px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              {user}
            </div>
          ))}
        </div>
      )}

      {/* DM목록 */}
      {activeTab === "dm" && (
        <div style={{ flex: 1 }}>
          {["현지훈", "이승훈"].map((user) => (
            <div
              key={user}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: "14px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              {user}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}