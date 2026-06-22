"use client";

import { useEffect, useState, useRef } from "react";
import { useChatSocket, ChatMessage } from "./useChatSocket";

const BACKEND_HTTP_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

type UserSummary = {
  id: number;
  username: string;
};

export default function ChatWindow() {
  const [activeTab, setActiveTab] = useState<"friends" | "dm">("friends");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { connected, messagesByUser, sendTalk, sendInvite, respondInvite, myUsername } =
    useChatSocket();

  const messageEndRef = useRef<HTMLDivElement>(null);

  // 친구/DM 탭을 열 때 전체 유저 목록을 가져옴 (받은 초대 목록 API는 아직 없어 동일 목록 재사용)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingUsers(true);
    fetch(`${BACKEND_HTTP_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`유저 목록 조회 실패: ${res.status}`);
        return res.json();
      })
      .then((data: UserSummary[]) => {
        // 본인은 목록에서 제외
        setUsers(data.filter((u) => u.username !== myUsername));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, [myUsername]);

  const currentMessages: ChatMessage[] = selectedUser
    ? messagesByUser[selectedUser] || []
    : [];

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const handleSend = () => {
    if (!selectedUser || !message.trim()) return;
    sendTalk(selectedUser, message);
    setMessage("");
  };

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

          <span
            style={{
              marginLeft: "auto",
              fontSize: "11px",
              color: connected ? "#22c55e" : "#999",
            }}
          >
            {connected ? "● 연결됨" : "○ 연결 안됨"}
          </span>
        </div>

        {/* 메시지 영역 */}
        <div
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
          }}
        >
          {currentMessages.length === 0 && (
            <div style={{ color: "#999", fontSize: 13, textAlign: "center", marginTop: 20 }}>
              아직 대화가 없습니다
            </div>
          )}

          {currentMessages.map((msg, idx) => {
            const isMine = msg.sender === myUsername;

            // 게임 초대 카드
            if (msg.type === "GAME_INVITE") {
              return (
                <GameInviteCard
                  key={idx}
                  msg={msg}
                  isMine={isMine}
                  onAccept={() =>
                    msg.inviteId &&
                    respondInvite(selectedUser, msg.inviteId, true)
                  }
                  onDecline={() =>
                    msg.inviteId &&
                    respondInvite(selectedUser, msg.inviteId, false)
                  }
                />
              );
            }

            // 수락/거절 결과 메시지는 시스템 안내 형태로 표시
            if (msg.type === "GAME_ACCEPT" || msg.type === "GAME_DECLINE") {
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: msg.type === "GAME_ACCEPT" ? "#22c55e" : "#ef4444",
                    margin: "8px 0",
                  }}
                >
                  {msg.type === "GAME_ACCEPT"
                    ? "게임 초대를 수락했습니다 🎮"
                    : "게임 초대를 거절했습니다"}
                </div>
              );
            }

            // 일반 채팅 메시지 (기존 디자인 그대로)
            return isMine ? (
              <div
                key={idx}
                style={{
                  marginLeft: "auto",
                  marginBottom: "10px",
                  background: "#1877F2",
                  color: "white",
                  padding: "8px",
                  borderRadius: "8px",
                  width: "fit-content",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                {msg.message}
              </div>
            ) : (
              <div
                key={idx}
                style={{
                  marginBottom: "10px",
                  background: "#f1f1f1",
                  padding: "8px",
                  borderRadius: "8px",
                  width: "fit-content",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                {msg.message}
              </div>
            );
          })}

          <div ref={messageEndRef} />
        </div>

        {/* 게임 초대 버튼 */}
        <div style={{ padding: "0 10px" }}>
          <button
            onClick={() => sendInvite(selectedUser)}
            disabled={!connected}
            style={{
              width: "100%",
              background: "#fff",
              color: "#1877F2",
              border: "1px solid #1877F2",
              padding: "6px",
              borderRadius: "8px",
              cursor: connected ? "pointer" : "not-allowed",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            🎮 게임 초대 보내기
          </button>
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지 입력"
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!connected}
            style={{
              background: "#1877F2",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: connected ? "pointer" : "not-allowed",
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
              activeTab === "friends" ? "3px solid #1877F2" : "3px solid transparent",
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
              activeTab === "dm" ? "3px solid #1877F2" : "3px solid transparent",
          }}
        >
          DM
        </button>
      </div>

      {/* 유저 목록 (친구/DM 탭 모두 동일한 전체 유저 목록 사용 - 친구/차단 관리 API가 생기기 전까지의 임시 처리) */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loadingUsers && (
          <div style={{ padding: 14, color: "#999", fontSize: 13 }}>불러오는 중...</div>
        )}

        {!loadingUsers && users.length === 0 && (
          <div style={{ padding: 14, color: "#999", fontSize: 13 }}>
            표시할 사용자가 없습니다
          </div>
        )}

        {!loadingUsers &&
          users.map((user) => {
            const hasUnread = (messagesByUser[user.username] || []).length > 0;
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user.username)}
                style={{
                  padding: "14px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{user.username}</span>
                {hasUnread && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#1877F2",
                    }}
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function GameInviteCard({
  msg,
  isMine,
  onAccept,
  onDecline,
}: {
  msg: ChatMessage;
  isMine: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div
      style={{
        marginLeft: isMine ? "auto" : 0,
        marginBottom: "10px",
        background: "#fff",
        border: "1px solid #1877F2",
        borderRadius: "10px",
        padding: "10px",
        width: "75%",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>
        🎮 게임 초대장
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
        {isMine ? "초대를 보냈습니다" : "게임에 초대받았습니다"}
      </div>

      {!isMine && (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            수락
          </button>
          <button
            onClick={onDecline}
            style={{
              flex: 1,
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            거절
          </button>
        </div>
      )}
    </div>
  );
}