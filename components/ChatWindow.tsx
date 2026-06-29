"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebSocket, DmMessage } from "./WebSocketProvider";
import { apiFetch } from "@/app/lib/api";

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
  const router = useRouter();
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

  const { messages: liveMessages, sendDm, resetUnread, connected, myUsername } = useWebSocket();

  // 팔로잉 목록
  useEffect(() => {
    if (activeTab !== "friends") return;
    const fetch = async () => {
      try {
        const res = await apiFetch("/api/follow/following");
        const data: string[] = await res.json();
        setFollowing(data);
      } catch (err: unknown) { console.error(err); }
    };
    fetch();
  }, [activeTab]);

  // DM 대화 목록
  useEffect(() => {
    if (activeTab !== "dm") return;
    const fetch = async () => {
      try {
        const res = await apiFetch("/api/dm/conversations");
        const data: DmConversation[] = await res.json();
        setConversations(data);
      } catch (err: unknown) { console.error(err); }
    };
    fetch();
  }, [activeTab]);

  // 채팅방 진입 시 히스토리 + 읽음 처리
  useEffect(() => {
    if (!selectedUser) return;
    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/api/dm/${selectedUser}`);
        const data: DmMessage[] = await res.json();
        setHistory(data);
      } catch (err: unknown) { console.error(err); }
    };
    const markAsRead = async () => {
      try {
        await apiFetch(`/api/dm/${selectedUser}/read`, { method: "PATCH" });
        resetUnread();
      } catch (err: unknown) { console.error(err); }
    };
    fetchHistory();
    markAsRead();
  }, [selectedUser]);

  // 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, liveMessages]);

  // 이 대화방 실시간 메시지 (중복 제거)
  const historyIds = new Set(history.map((m) => m.id));
  const relevantLiveMessages = liveMessages.filter(
    (m) =>
      (m.senderUsername === selectedUser || m.receiverUsername === selectedUser) &&
      !historyIds.has(m.id)
  );
  const allMessages = [...history, ...relevantLiveMessages];

  const handleSend = () => {
    if (!input.trim() || !selectedUser) return;
    sendDm(selectedUser, input, "TALK");
    setInput("");
  };

  // 게임 초대 전송
 const handleGameInvite = () => {
  if (!selectedUser) return;
  const roomId = crypto.randomUUID();
  
  // 임시 디버그
  console.log("게임 초대 전송:", { receiverUsername: selectedUser, content: "게임 초대를 보냈습니다 🎮", type: "GAME_INVITE", roomId });
  
  sendDm(selectedUser, "게임 초대를 보냈습니다 🎮", "GAME_INVITE", roomId);
};

  // 게임 초대 수락
  const handleAccept = (msg: DmMessage) => {
    if (!msg.roomId || !selectedUser) return;
    sendDm(selectedUser, "게임 초대를 수락했습니다 🎮", "GAME_ACCEPT", msg.roomId);
    localStorage.setItem("gameColor", "WHITE");
    router.push(`/game/${msg.roomId}`);
  };

  // 게임 초대 거절
  const handleDecline = (msg: DmMessage) => {
    if (!msg.roomId || !selectedUser) return;
    sendDm(selectedUser, "게임 초대를 거절했습니다", "GAME_DECLINE", msg.roomId);
  };

  // 내가 보낸 초대가 수락됐을 때 게임 페이지로 이동
  useEffect(() => {
  const accepted = liveMessages.find(
    (m) => m.type === "GAME_ACCEPT" && m.receiverUsername === myUsername
  );
  if (accepted?.roomId) {
    localStorage.setItem("gameColor", "BLACK");
    router.push(`/game/${accepted.roomId}`);
  }
}, [liveMessages, myUsername]);

  // 이메일 검색
  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    setSearchResult(null);
    setSearchError("");
    try {
      const res = await apiFetch(`/api/follow/search?username=${encodeURIComponent(searchUsername)}`);
      if (res.status === 404) { setSearchError("해당 유저를 찾을 수 없습니다."); return; }
      const data: SearchResult = await res.json();
      setSearchResult(data);
    } catch (err: unknown) { console.error(err); }
  };

  const handleFollow = async (targetUsername: string) => {
    try {
      await apiFetch(`/api/follow/${targetUsername}`, { method: "POST" });
      setSearchResult((prev) => prev ? { ...prev, isFollowing: true } : prev);
      setFollowing((prev) => [...prev, targetUsername]);
    } catch (err: unknown) { console.error(err); }
  };

  const handleUnfollow = async (targetUsername: string) => {
    try {
      await apiFetch(`/api/follow/${targetUsername}`, { method: "DELETE" });
      setSearchResult((prev) => prev ? { ...prev, isFollowing: false } : prev);
      setFollowing((prev) => prev.filter((u) => u !== targetUsername));
    } catch (err: unknown) { console.error(err); }
  };

  const containerStyle: React.CSSProperties = {
    position: "fixed", bottom: "100px", right: "20px",
    width: "350px", height: "500px", background: "white",
    border: "1px solid #ddd", borderRadius: "12px",
    zIndex: 99999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    display: "flex", flexDirection: "column",
  };

  // ========================
  // 채팅방 화면
  // ========================
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
          <span style={{ marginLeft: "auto", fontSize: "11px", color: connected ? "#22c55e" : "#999" }}>
            {connected ? "● 연결됨" : "○ 연결 안됨"}
          </span>
        </div>

        {/* 메시지 영역 */}
        <div style={{ flex: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          
          
          {allMessages.map((m, i) => {
            const isMine = m.senderUsername === myUsername;
              
            // 게임 초대 카드
            if (m.type === "GAME_INVITE") {
              return (
                <div
                  key={m.id ?? i}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    border: "1px solid #1877F2",
                    borderRadius: "10px",
                    padding: "10px",
                    width: "75%",
                    background: "#fff",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>🎮 게임 초대장</div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: isMine ? 0 : 8 }}>
                    {isMine ? "초대를 보냈습니다" : "게임에 초대받았습니다"}
                  </div>
                  {!isMine && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleAccept(m)}
                        style={{ flex: 1, background: "#22c55e", color: "white", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", fontSize: 12 }}
                      >
                        수락
                      </button>
                      <button
                        onClick={() => handleDecline(m)}
                        style={{ flex: 1, background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", fontSize: 12 }}
                      >
                        거절
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 수락/거절 결과
            if (m.type === "GAME_ACCEPT" || m.type === "GAME_DECLINE") {
              return (
                <div key={m.id ?? i} style={{ textAlign: "center", fontSize: 12, color: m.type === "GAME_ACCEPT" ? "#22c55e" : "#ef4444", margin: "4px 0" }}>
                  {m.content}
                </div>
              );
            }

            // 일반 메시지
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

        {/* 게임 초대 버튼 */}
        <div style={{ padding: "0 10px 8px" }}>
          <button
            onClick={handleGameInvite}
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
            }}
          >
            🎮 게임 초대 보내기
          </button>
        </div>

        {/* 입력창 */}
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
            disabled={!connected}
            style={{ background: "#1877F2", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: connected ? "pointer" : "not-allowed" }}
          >
            전송
          </button>
        </div>
      </div>
    );
  }

  // ========================
  // 목록 화면 (기존 그대로)
  // ========================
  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", padding: "10px", borderBottom: "1px solid #eee", background: "#fafafa", borderRadius: "12px 12px 0 0" }}>
        <button onClick={() => setActiveTab("friends")} style={{ flex: 1, borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: activeTab === "friends" ? "3px solid #1877F2" : "3px solid transparent", background: "none", cursor: "pointer", padding: "10px", fontWeight: activeTab === "friends" ? "bold" : "normal", color: activeTab === "friends" ? "#1877F2" : "#666" }}>
          친구
        </button>
        <button onClick={() => setActiveTab("dm")} style={{ flex: 1, borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: activeTab === "dm" ? "3px solid #1877F2" : "3px solid transparent", background: "none", cursor: "pointer", padding: "10px", fontWeight: activeTab === "dm" ? "bold" : "normal", color: activeTab === "dm" ? "#1877F2" : "#666" }}>
          DM
        </button>
      </div>

      {activeTab === "friends" && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={searchUsername}
                onChange={(e) => { setSearchUsername(e.target.value); setSearchResult(null); setSearchError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="username으로 검색"
                style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px" }}
              />
              <button onClick={handleSearch} style={{ background: "#1877F2", color: "white", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>검색</button>
            </div>
            {searchError && <p style={{ fontSize: "12px", color: "#e53e3e", marginTop: "8px" }}>{searchError}</p>}
            {searchResult && (
              <div style={{ marginTop: "10px", padding: "10px", background: "#f9f9f9", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>{searchResult.username}</p>
                <button
                  onClick={() => searchResult.isFollowing ? handleUnfollow(searchResult.username) : handleFollow(searchResult.username)}
                  style={{ background: searchResult.isFollowing ? "#eee" : "#1877F2", color: searchResult.isFollowing ? "#333" : "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                >
                  {searchResult.isFollowing ? "언팔로우" : "팔로우"}
                </button>
              </div>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {following.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>팔로우한 친구가 없습니다.</div>
            ) : (
              following.map((username) => (
                <div key={username} style={{ padding: "14px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>{username}</span>
                  <button onClick={() => setSelectedUser(username)} style={{ background: "#1877F2", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}>DM</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "dm" && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: "14px" }}>아직 대화가 없습니다.</div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.otherUsername} onClick={() => setSelectedUser(conv.otherUsername)} style={{ padding: "14px", borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{conv.otherUsername}</span>
                <span style={{ fontSize: "12px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.lastMessage}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}