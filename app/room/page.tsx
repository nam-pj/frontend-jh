"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_HTTP_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function RoomLobbyPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_HTTP_URL}/api/rooms`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (!res.ok) { setError("방 생성에 실패했습니다."); return; }
    const data = await res.json();
    router.push(`/room/${data.roomId}`);
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_HTTP_URL}/api/rooms/${roomCode.toUpperCase()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoading(false);
    if (!res.ok) { setError("존재하지 않는 방 코드입니다."); return; }
    router.push(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: 20,
    }}>
      {/* 로고 */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>💬</div>
        <h1 style={{
          color: "white",
          fontSize: 36,
          fontWeight: 800,
          margin: 0,
          letterSpacing: -1,
        }}>
          끝말잇기
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 8, fontSize: 15 }}>
          친구와 함께 단어 배틀을 시작하세요
        </p>
      </div>

      {/* 카드 */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: 40,
        width: "100%",
        maxWidth: 420,
      }}>
        {/* 방 만들기 */}
        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 16,
            transition: "opacity 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "처리 중..." : "✨ 새 방 만들기"}
        </button>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* 방 코드 입력 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            placeholder="방 코드 입력 (예: A3F9K2)"
            maxLength={6}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.07)",
              color: "white",
              fontSize: 18,
              textAlign: "center",
              letterSpacing: 6,
              outline: "none",
              fontWeight: 700,
            }}
          />
          <button
            onClick={joinRoom}
            disabled={loading || !roomCode.trim()}
            style={{
              padding: "14px",
              background: roomCode.trim() ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: roomCode.trim() ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            방 입장하기 →
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 14,
            textAlign: "center",
          }}>
            {error}
          </div>
        )}
      </div>

      {/* 뒤로가기 */}
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: 24,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.3)",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← 홈으로 돌아가기
      </button>
    </div>
  );
}