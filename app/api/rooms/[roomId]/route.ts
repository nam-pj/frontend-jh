// app/api/rooms/[roomId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> } // 💡 params를 Promise 타입으로 정의
) {
  // 1. 비동기로 쿠키 스토어를 가져와 토큰 추출
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value;

  // 2. 비동기로 파라미터(roomId) 꺼내기
  const { roomId } = await params; 

  try {
    // 3. 백엔드 Spring Boot 서버의 방 상세 조회 API로 요청을 전달
    const response = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 추출한 토큰을 Bearer 헤더에 탑재
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "백엔드 방 정보 조회 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Next.js GET [roomId] Proxy Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}