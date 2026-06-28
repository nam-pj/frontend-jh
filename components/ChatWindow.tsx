"use client";

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { apiFetch } from "@/app/lib/api";

interface DmMessage {
  id: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  sentAt: string;
}

interface DmConversation {
  otherUsername: string;
  lastMessage: string;
  sentAt: string;
}

interface SearchResult {
  username: string;
  isFollowing: boolean;
}

export default function ChatWindow() {

  const [activeTab, setActiveTab] = useState<"friends" | "dm">("friends");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<DmConversation[]>([]);
  const [history, setHistory] = useState<DmMessage[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages: liveMessages, sendDm, resetUnread } = useWebSocket();


  
  // 팔로잉 목록 불러오기
  useEffect(() => {
    if (activeTab !== "friends") return;

    const fetchFollowing = async () => {
      try {
        const res = await apiFetch("/api/follow/following");
        const data: string[] = await res.json();
        setFollowing(data);
      } catch (err: unknown) {
        console.error("팔로잉 목록 조회 실패:", err);
      }
    };

    fetchFollowing();
  }, [activeTab]);

  // DM 대화 목록 불러오기
  useEffect(() => {
    if (activeTab !== "dm") return;

    const fetchConversations = async () => {
      try {
        const res = await apiFetch("/api/dm/conversations");
        const data: DmConversation[] = await res.json();
        setConversations(data);
      } catch (err: unknown) {
        console.error("대화 목록 조회 실패:", err);
      }
    };

    fetchConversations();
  }, [activeTab]);

  // 채팅방 진입 시 과거 내역 불러오기
  useEffect(() => {
  if (!selectedUser) return;

  const fetchHistory = async () => {
    try {
      const res = await apiFetch(`/api/dm/${selectedUser}`);
      const data: DmMessage[] = await res.json();
      setHistory(data);
    } catch (err: unknown) {
      console.error("대화 내역 조회 실패:", err);
    }
  };

  // 읽음 처리
  const markAsRead = async () => {
    try {
      await apiFetch(`/api/dm/${selectedUser}/read`, { method: "PATCH" });
      resetUnread(); // 뱃지 초기화
    } catch (err: unknown) {
      console.error("읽음 처리 실패:", err);
    }
  };

  fetchHistory();
  markAsRead();
}, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, liveMessages]);
  const historyIds = new Set(history.map((m) => m.id));
  const relevantLiveMessages = liveMessages.filter(
  (m) =>
    (m.senderUsername === selectedUser || m.receiverUsername === selectedUser) &&
    !historyIds.has(m.id)
);

  const allMessages = [...history, ...relevantLiveMessages];

  const handleSend = () => {
    if (!input.trim() || !selectedUser) return;
    sendDm(selectedUser, input);
    setInput("");
  };

  // 이메일 검색
  const handleSearch = async () => {
  if (!searchUsername.trim()) return;
  setSearchResult(null);
  setSearchError("");

  try {
    const res = await apiFetch(`/api/follow/search?username=${encodeURIComponent(searchUsername)}`);
    if (res.status === 404) {
      setSearchError("해당 유저를 찾을 수 없습니다.");
      return;
    }
    const data: SearchResult = await res.json();
    setSearchResult(data);
  } catch (err: unknown) {
    console.error("검색 실패:", err);
  }
};

  // 팔로우
  const handleFollow = async (targetUsername: string) => {
    try {
      await apiFetch(`/api/follow/${targetUsername}`, { method: "POST" });
      setSearchResult((prev) => prev ? { ...prev, isFollowing: true } : prev);
      setFollowing((prev) => [...prev, targetUsername]);
    } catch (err: unknown) {
      console.error("팔로우 실패:", err);
    }
  };

  // 언팔로우
  const handleUnfollow = async (targetUsername: string) => {
    try {
      await apiFetch(`/api/follow/${targetUsername}`, { method: "DELETE" });
      setSearchResult((prev) => prev ? { ...prev, isFollowing: false } : prev);
      setFollowing((prev) => prev.filter((u) => u !== targetUsername));
    } catch (err: unknown) {
      console.error("언팔로우 실패:", err);
    }
  };

  const containerStyle: React.CSSProperties = {
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
  };

  // 채팅방 화면
  if (selectedUser) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: "12px", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => { setSelectedUser(null); setHistory([]); }}
            style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px" }}
          >
            ←
          </button>
          <strong>{selectedUser}</strong>
        </div>

        <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {allMessages.map((m, i) => {
            const isMine = m.receiverUsername === selectedUser;
            return (
              <div
                key={m.id ?? i}
                style={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  background: isMine ? "#1877F2" : "#f1f1f1",
                  color: isMine ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "75%",
                  wordBreak: "break-word",
                  fontSize: "14px",
                }}
              >
                {m.content}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ borderTop: "1px solid #ddd", padding: "10px", display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지 입력"
            style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}
          />
          <button
            onClick={handleSend}
            style={{ background: "#1877F2", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}
          >
            전송
          </button>
        </div>
      </div>
    );
  }

  // 목록 화면
  return (
    <div style={containerStyle}>
      {/* 탭 */}
      <div style={{ display: "flex", padding: "10px", borderBottom: "1px solid #eee", background: "#fafafa", borderRadius: "12px 12px 0 0" }}>
        <button
          onClick={() => setActiveTab("friends")}
          style={{ flex: 1, borderTop: "none",borderLeft: "none",borderRight: "none", borderBottom: activeTab === "friends" ? "3px solid #1877F2" : "3px solid transparent", background: "none", cursor: "pointer", padding: "10px", fontWeight: activeTab === "friends" ? "bold" : "normal", color: activeTab === "friends" ? "#1877F2" : "#666" }}
        >
          친구
        </button>
        <button
          onClick={() => setActiveTab("dm")}
          style={{ flex: 1,  borderTop: "none",borderLeft: "none",borderRight: "none", borderBottom: activeTab === "dm" ? "3px solid #1877F2" : "3px solid transparent", background: "none", cursor: "pointer", padding: "10px", fontWeight: activeTab === "dm" ? "bold" : "normal", color: activeTab === "dm" ? "#1877F2" : "#666" }}
        >
          DM
        </button>
      </div>

      {/* 친구 탭 */}
      {activeTab === "friends" && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* 이메일 검색 */}
          <div style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "8px" }}>
             <input
            value={searchUsername}
            onChange={(e) => { setSearchUsername(e.target.value); setSearchResult(null); setSearchError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="username으로 검색"
            style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px" }}
          />
              <button
                onClick={handleSearch}
                style={{ background: "#1877F2", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
              >
                검색
              </button>
            </div>

            {/* 검색 결과 */}
            {searchError && (
              <p style={{ fontSize: "12px", color: "#e53e3e", marginTop: "8px" }}>{searchError}</p>
            )}
            {searchResult && (
  <div style={{ marginTop: "10px", padding: "10px", background: "#f9f9f9", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>
      {searchResult.username}
    </p>
    <button
      onClick={() => searchResult.isFollowing ? handleUnfollow(searchResult.username) : handleFollow(searchResult.username)}
      style={{
        background: searchResult.isFollowing ? "#eee" : "#1877F2",
        color: searchResult.isFollowing ? "#333" : "white",
        border: "none",
        padding: "6px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      {searchResult.isFollowing ? "언팔로우" : "팔로우"}
    </button>
  </div>
)}
          </div>

          {/* 팔로잉 목록 */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {following.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
                팔로우한 친구가 없습니다.
              </div>
            ) : (
              following.map((username) => (
                <div
                  key={username}
                  style={{ padding: "14px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>{username}</span>
                  <button
                    onClick={() => setSelectedUser(username)}
                    style={{ background: "#1877F2", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                  >
                    DM
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DM 탭 */}
      {activeTab === "dm" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>
              아직 대화가 없습니다.
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.otherUsername}
                onClick={() => setSelectedUser(conv.otherUsername)}
                style={{ padding: "14px", borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{conv.otherUsername}</span>
                <span style={{ fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.lastMessage}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}