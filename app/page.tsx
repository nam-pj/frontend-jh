"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setUsername(name || "");
  }, []);

  const BACKEND_HTTP_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

 const createRoom = async () => {
  const res = await fetch(`/api/rooms`, {
    method: "POST",
    // Next.js 라우터(프록시)로 보내므로 토큰 헤더가 필요 없습니다.
  });
  if (!res.ok) return alert("방 생성에 실패했습니다.");
  const data = await res.json();
  router.push(`/room/${data.roomId}`);
};

  const joinRoom = async () => {
  if (!roomCode.trim()) return;
  const res = await fetch(`/api/rooms/${roomCode.toUpperCase()}`, {
    method: "GET",
  });
  if (!res.ok) return alert("존재하지 않는 방 코드입니다.");
  router.push(`/room/${roomCode.toUpperCase()}`);
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* 히어로 섹션 */}
        <div style={{ textAlign: "center", marginBottom: 72, paddingTop: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
          <h1 style={{
            color: "white",
            fontSize: 52,
            fontWeight: 900,
            margin: 0,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}>
            친구와 함께하는
            <br />
            <span style={{
              background: "linear-gradient(135deg, #667eea, #f093fb)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              실시간 게임
            </span>
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 17,
            marginTop: 16,
            marginBottom: 0,
          }}>
            채팅, 오목, 끝말잇기까지 — 지금 바로 시작하세요
          </p>
          {isLoggedIn && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 8 }}>
              환영합니다, <b style={{ color: "rgba(255,255,255,0.6)" }}>{username}</b>님 👋
            </p>
          )}
        </div>

        {/* 게임 카드 목록 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}>

          {/* 끝말잇기 카드 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: 28,
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
              끝말잇기
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              3~4명이 함께 단어를 이어가는 게임. 30초 안에 단어를 입력하지 못하면 탈락!
            </p>

            {isLoggedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                <button
                  onClick={createRoom}
                  style={{
                    padding: "13px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ✨ 방 만들기
                </button>

                {!showJoinInput ? (
                  <button
                    onClick={() => setShowJoinInput(true)}
                    style={{
                      padding: "13px",
                      background: "rgba(255,255,255,0.08)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    방 코드로 입장
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                      placeholder="코드 입력"
                      maxLength={6}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.07)",
                        color: "white",
                        fontSize: 16,
                        textAlign: "center",
                        letterSpacing: 4,
                        fontWeight: 700,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={joinRoom}
                      style={{
                        padding: "12px 16px",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                marginTop: "auto",
                padding: "12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
                textAlign: "center",
              }}>
                🔒 로그인 후 플레이할 수 있습니다
              </div>
            )}
          </div>

          {/* 오목 카드 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: 28,
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
              오목
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              1:1 오목 대결. 채팅으로 상대를 초대하고 15x15 바둑판에서 5개를 먼저 연결하세요.
            </p>
            <div style={{
              marginTop: "auto",
              padding: "12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              textAlign: "center",
            }}>
              💬 채팅에서 상대방을 초대하세요
            </div>
          </div>

          {/* 1:1 채팅 카드 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24,
            padding: 28,
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
              1:1 채팅
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              친구와 실시간으로 대화하고 게임에 초대하세요. 우측 하단 버튼으로 바로 시작.
            </p>
            <div style={{
              marginTop: "auto",
              padding: "12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              textAlign: "center",
            }}>
              💬 우측 하단 채팅 버튼을 눌러보세요
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}