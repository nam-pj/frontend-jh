"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SockJS from "sockjs-client";

declare global {
  interface Window {
    Stomp: any;
  }
}

const BACKEND_HTTP_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
const BOARD_SIZE = 15;
const CELL = 40;
const PADDING = 24;

type Cell = null | "BLACK" | "WHITE";

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [myColor, setMyColor] = useState<"BLACK" | "WHITE">("BLACK");

  const [board, setBoard] = useState<Cell[][]>(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [currentTurn, setCurrentTurn] = useState<"BLACK" | "WHITE">("BLACK");
  const [winner, setWinner] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const stompClientRef = useRef<any>(null);
  const myUsernameRef = useRef<string | null>(null);

  // 마운트 후 localStorage에서 읽기
  useEffect(() => {
    const color = (localStorage.getItem("gameColor") as "BLACK" | "WHITE") ?? "BLACK";
    myUsernameRef.current = localStorage.getItem("username");
    setMyColor(color);
    setMounted(true);
  }, []);

  const checkWin = (b: Cell[][], row: number, col: number, color: Cell): boolean => {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (let d = 1; d < 5; d++) {
        const r = row + dr * d, c = col + dc * d;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || b[r][c] !== color) break;
        count++;
      }
      for (let d = 1; d < 5; d++) {
        const r = row - dr * d, c = col - dc * d;
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || b[r][c] !== color) break;
        count++;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !roomId) return;

    const loadStomp = () =>
      new Promise<void>((resolve, reject) => {
        if (window.Stomp) { resolve(); return; }
        const existing = document.querySelector(`script[src*="stomp"]`);
        if (existing) {
          const timer = setInterval(() => {
            if (window.Stomp) { clearInterval(timer); resolve(); }
          }, 50);
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js";
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

          if (msg.type === "GAME_MOVE" && msg.message) {
            const { row, col, color } = JSON.parse(msg.message);
            setBoard((prev) => {
              const next = prev.map((r: Cell[]) => [...r]);
              next[row][col] = color;
              if (checkWin(next, row, col, color)) {
                setWinner(msg.sender);
              }
              return next;
            });
            setCurrentTurn(color === "BLACK" ? "WHITE" : "BLACK");
          }
        });
      });

      stompClientRef.current = client;
    })();

    return () => {
      cancelled = true;
      stompClientRef.current?.disconnect(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleClick = (row: number, col: number) => {
    if (!connected || winner || board[row][col] || currentTurn !== myColor) return;

    const msg = {
      roomId,
      type: "GAME_MOVE",
      sender: myUsernameRef.current,
      message: JSON.stringify({ row, col, color: myColor }),
    };
    stompClientRef.current.send("/app/game.move", {}, JSON.stringify(msg));
  };

  // 마운트 전에는 렌더링 안 함 (SSR/CSR 불일치 방지)
  if (!mounted) return null;

  const boardPx = (BOARD_SIZE - 1) * CELL;
  const myUsername = myUsernameRef.current;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 40,
        background: "#fafaf7",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>🎯 오목</h2>

      <div style={{ marginBottom: 16, fontSize: 14, color: "#555", textAlign: "center" }}>
        {!connected && <span>연결 중...</span>}
        {connected && !winner && (
          <>
            <div>
              나: <b>{myColor === "BLACK" ? "⚫ 흑" : "⚪ 백"}</b> ({myUsername})
            </div>
            <div style={{ marginTop: 4 }}>
              현재 차례: <b>{currentTurn === "BLACK" ? "⚫ 흑" : "⚪ 백"}</b>
              {currentTurn === myColor ? (
                <span style={{ color: "#22c55e", marginLeft: 6 }}>← 내 차례</span>
              ) : (
                <span style={{ color: "#999", marginLeft: 6 }}>상대 차례</span>
              )}
            </div>
          </>
        )}
        {winner && (
          <span style={{ color: "#1877F2", fontWeight: "bold", fontSize: 20 }}>
            🏆 {winner === myUsername ? "내가 이겼습니다!" : `${winner} 승리!`}
          </span>
        )}
      </div>

      {/* 오목판 */}
      <div
        style={{
          position: "relative",
          background: "#dcb97a",
          width: boardPx + PADDING * 2,
          height: boardPx + PADDING * 2,
          borderRadius: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* 격자선 SVG */}
        <svg
          style={{
            position: "absolute",
            top: PADDING,
            left: PADDING,
            pointerEvents: "none",
          }}
          width={boardPx}
          height={boardPx}
        >
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={boardPx} stroke="#8B6914" strokeWidth={1} />
              <line x1={0} y1={i * CELL} x2={boardPx} y2={i * CELL} stroke="#8B6914" strokeWidth={1} />
            </g>
          ))}
          {[3, 7, 11].map((r) =>
            [3, 7, 11].map((c) => (
              <circle key={`${r}-${c}`} cx={c * CELL} cy={r * CELL} r={4} fill="#8B6914" />
            ))
          )}
        </svg>

        {/* 클릭 영역 */}
        <div style={{ position: "absolute", top: PADDING, left: PADDING }}>
          {board.map((row, r) => (
            <div key={r} style={{ display: "flex" }}>
              {row.map((cell, c) => (
                <div
                  key={c}
                  onClick={() => handleClick(r, c)}
                  style={{
                    width: CELL,
                    height: CELL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "translate(-50%, -50%)",
                    cursor: !winner && !cell && currentTurn === myColor ? "pointer" : "default",
                  }}
                >
                  {cell && (
                    <div
                      style={{
                        width: CELL - 6,
                        height: CELL - 6,
                        borderRadius: "50%",
                        background:
                          cell === "BLACK"
                            ? "radial-gradient(circle at 35% 35%, #555, #000)"
                            : "radial-gradient(circle at 35% 35%, #fff, #ccc)",
                        boxShadow: "1px 2px 4px rgba(0,0,0,0.4)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("gameColor");
          router.push("/");
        }}
        style={{
          marginTop: 24,
          padding: "10px 24px",
          borderRadius: 8,
          border: "none",
          background: "#1877F2",
          color: "white",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        메인으로 돌아가기
      </button>
    </div>
  );
}