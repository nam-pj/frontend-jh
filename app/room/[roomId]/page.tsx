"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SockJS from "sockjs-client";

declare global { interface Window { Stomp: any; } }

const BACKEND_HTTP_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const TURN_SECONDS = 30;

type Player = { username: string; hp: number; alive: boolean; };
type ChatLog = { sender: string; word: string; type: "correct" | "wrong" | "system"; reason?: string; };

export default function WordChainPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const stompClientRef = useRef<any>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentTurn, setCurrentTurn] = useState("");
  const [lastWord, setLastWord] = useState("");
  const [chatLog, setChatLog] = useState<ChatLog[]>([]);
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myUsername, setMyUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(TURN_SECONDS);

  useEffect(() => {
    setMyUsername(localStorage.getItem("username") || "");
    setMounted(true);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("token");
    if (!token || !roomId) return;

    const loadStomp = () => new Promise<void>((resolve, reject) => {
      if (window.Stomp) { resolve(); return; }
      const existing = document.querySelector(`script[src*="stomp"]`);
      if (existing) {
        const timer = setInterval(() => { if (window.Stomp) { clearInterval(timer); resolve(); } }, 50);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });

    let cancelled = false;
    (async () => {
      await loadStomp();
      if (cancelled) return;

      const socket = new SockJS(`${BACKEND_HTTP_URL}/ws-stomp`);
      const client = window.Stomp.over(socket);
      client.debug = () => {};

      client.connect({ Authorization: `Bearer ${token}` }, () => {
        if (cancelled) return;
        setConnected(true);

        client.subscribe(`/topic/room/${roomId}`, (frame: any) => {
          const msg = JSON.parse(frame.body);

          if (msg.type === "ROOM_JOIN") {
            setPlayers(msg.players);
            setChatLog(prev => [...prev, { sender: "시스템", word: `${msg.sender}님이 입장했습니다.`, type: "system" }]);
          }
          if (msg.type === "ROOM_LEAVE") {
            setPlayers(msg.players);
            setChatLog(prev => [...prev, { sender: "시스템", word: `${msg.sender}님이 퇴장했습니다.`, type: "system" }]);
          }
          if (msg.type === "ROOM_START") {
            setStarted(true);
            setPlayers(msg.players);
            setCurrentTurn(msg.currentTurn);
            setLastWord("");
            setTimeLeft(TURN_SECONDS);
            setChatLog([{ sender: "시스템", word: "게임 시작! 아무 단어나 입력하세요.", type: "system" }]);
          }
          if (msg.type === "ROOM_TIMER") {
            setTimeLeft(Number(msg.message));
          }
          if (msg.type === "ROOM_WORD") {
            setPlayers(msg.players);
            setLastWord(msg.lastWord);
            setCurrentTurn(msg.currentTurn);
            setTimeLeft(TURN_SECONDS);
            setChatLog(prev => [...prev, { sender: msg.sender, word: msg.message, type: "correct" }]);
          }
          if (msg.type === "ROOM_WRONG") {
            setChatLog(prev => [...prev, { sender: msg.sender || "시스템", word: msg.message || "", type: "wrong", reason: msg.reason }]);
          }
          if (msg.type === "ROOM_STATE") {
            setPlayers(msg.players);
            setCurrentTurn(msg.currentTurn);
            setLastWord(msg.lastWord);
            setTimeLeft(TURN_SECONDS);
          }
          if (msg.type === "ROOM_END") {
            setWinner(msg.winner);
            setStarted(false);
            setPlayers(msg.players);
            setChatLog(prev => [...prev, { sender: "시스템", word: `🏆 ${msg.winner} 승리!`, type: "system" }]);
          }
        });

        client.send("/app/room.join", {}, JSON.stringify({ roomId }));

        fetch(`${BACKEND_HTTP_URL}/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).then(data => {
          setIsHost(data.hostUsername === localStorage.getItem("username"));
        });
      });

      stompClientRef.current = client;
    })();

    return () => {
      cancelled = true;
      stompClientRef.current?.send("/app/room.leave", {}, JSON.stringify({ roomId }));
      stompClientRef.current?.disconnect(() => {});
    };
  }, [mounted, roomId]);

  const startGame = () => stompClientRef.current?.send("/app/room.start", {}, JSON.stringify({ roomId }));

  const submitWord = () => {
    const word = input.trim();
    if (!word || currentTurn !== myUsername) return;
    stompClientRef.current?.send("/app/room.word", {}, JSON.stringify({ roomId, message: word }));
    setInput("");
  };

  const isMyTurn = currentTurn === myUsername;
  const lastChar = lastWord ? lastWord.charAt(lastWord.length - 1) : null;
  const timerPct = (timeLeft / TURN_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? "#667eea" : timeLeft > 5 ? "#f59e0b" : "#ef4444";
  const COLORS = ["#667eea", "#f093fb", "#4facfe", "#43e97b"];

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* 헤더 */}
      <div style={{ width: "100%", maxWidth: 900, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>💬</span>
          <span style={{ color: "white", fontWeight: 800, fontSize: 20 }}>끝말잇기</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>방 코드</span>
          <span style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "4px 12px",
            color: "white",
            fontWeight: 800,
            letterSpacing: 4,
            fontSize: 16,
          }}>{roomId}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 900 }}>

        {/* 왼쪽 사이드바 */}
        <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* 플레이어 목록 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 20,
          }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
              플레이어 {Object.keys(players).length}/4
            </div>

            {Object.values(players).map((p, i) => {
              const isCurrentTurn = p.username === currentTurn;
              return (
                <div key={p.username} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  marginBottom: 6,
                  background: isCurrentTurn && started ? "rgba(102,126,234,0.2)" : "transparent",
                  border: isCurrentTurn && started ? "1px solid rgba(102,126,234,0.3)" : "1px solid transparent",
                  opacity: p.alive ? 1 : 0.35,
                  transition: "all 0.3s",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: COLORS[i % COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {p.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.username}
                      {p.username === myUsername && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginLeft: 4 }}>나</span>}
                    </div>
                    {!p.alive && <div style={{ color: "#ef4444", fontSize: 11 }}>탈락</div>}
                  </div>
                  {isCurrentTurn && started && <span style={{ fontSize: 16 }}>✏️</span>}
                </div>
              );
            })}
          </div>

          {/* 시작/대기 버튼 */}
          {!started && !winner && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 20,
              textAlign: "center",
            }}>
              {isHost ? (
                <>
                  <button
                    onClick={startGame}
                    disabled={Object.keys(players).length < 2}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: Object.keys(players).length >= 2
                        ? "linear-gradient(135deg, #667eea, #764ba2)"
                        : "rgba(255,255,255,0.05)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: Object.keys(players).length >= 2 ? "pointer" : "not-allowed",
                    }}
                  >
                    {Object.keys(players).length >= 2 ? "🚀 게임 시작" : "2명 이상 필요"}
                  </button>
                  {Object.keys(players).length < 2 && (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 10, marginBottom: 0 }}>
                      친구가 입장하길 기다리는 중...
                    </p>
                  )}
                </>
              ) : (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
                  방장이 게임을 시작하길 기다리는 중...
                </p>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽 메인 영역 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* 현재 상태 + 타이머 */}
          {started && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                {lastChar ? (
                  <>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>마지막 단어</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{ color: "white", fontSize: 24, fontWeight: 800 }}>{lastWord}</span>
                      <span style={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        borderRadius: 8,
                        padding: "2px 10px",
                        color: "white",
                        fontSize: 14,
                        fontWeight: 700,
                      }}>
                        "{lastChar}" 로 시작
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>아무 단어나 입력하세요!</div>
                )}
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  {isMyTurn ? (
                    <span style={{ color: "#43e97b", fontWeight: 700 }}>✏️ 내 차례입니다!</span>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{currentTurn}님의 차례...</span>
                  )}
                </div>
              </div>

              {/* 원형 타이머 */}
              <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle
                    cx="36" cy="36" r="30" fill="none"
                    stroke={timerColor}
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s, stroke 0.3s" }}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: timerColor, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{timeLeft}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>초</span>
                </div>
              </div>
            </div>
          )}

          {/* 채팅 로그 */}
          <div
            ref={logRef}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20,
              padding: 20,
              flex: 1,
              minHeight: 320,
              maxHeight: 380,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {chatLog.length === 0 && (
              <div style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 60, fontSize: 14 }}>
                게임이 시작되면 단어가 여기 표시됩니다
              </div>
            )}
            {chatLog.map((log, i) => (
              <div key={i} style={{ padding: "3px 0" }}>
                {log.type === "system" ? (
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", padding: "6px 0" }}>
                    {log.word}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, flexShrink: 0, minWidth: 60 }}>{log.sender}</span>
                    <span style={{
                      fontSize: 17,
                      fontWeight: log.type === "correct" ? 600 : 700,
                      color: log.type === "correct" ? "white" : "#fca5a5",
                      textDecoration: log.type === "wrong" ? "line-through" : "none",
                    }}>
                      {log.word}
                    </span>
                    {log.type === "wrong" && log.reason && (
                      <span style={{ color: "#f87171", fontSize: 12 }}>← {log.reason}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 입력창 */}
          {started && (
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitWord()}
                placeholder={
                  isMyTurn
                    ? lastChar ? `"${lastChar}"(으)로 시작하는 단어를 입력하세요` : "아무 단어나 입력하세요"
                    : `${currentTurn}님이 입력 중...`
                }
                disabled={!isMyTurn}
                autoFocus={isMyTurn}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: `2px solid ${isMyTurn ? "rgba(102,126,234,0.6)" : "rgba(255,255,255,0.08)"}`,
                  background: isMyTurn ? "rgba(102,126,234,0.1)" : "rgba(255,255,255,0.03)",
                  color: "white",
                  fontSize: 16,
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
              <button
                onClick={submitWord}
                disabled={!isMyTurn || !input.trim()}
                style={{
                  padding: "14px 24px",
                  background: isMyTurn && input.trim()
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isMyTurn && input.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                입력 →
              </button>
            </div>
          )}

          {/* 승리 화면 */}
          {winner && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: 40,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div style={{
                color: "white",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
              }}>
                {winner === myUsername ? "내가 이겼습니다!" : `${winner} 승리!`}
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24, fontSize: 14 }}>
                수고하셨습니다
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => router.push("/room")}
                  style={{
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  다시 하기
                </button>
                <button
                  onClick={() => router.push("/")}
                  style={{
                    padding: "12px 28px",
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  홈으로
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}