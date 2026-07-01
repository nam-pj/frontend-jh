// app/api/rooms/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // 1. 비동기로 쿠키 스토어 가져오기
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    // 2. 백엔드 Spring Boot 서버로 요청 전달
    const response = await fetch("http://localhost:8080/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 쿠키에서 꺼낸 JWT 탑재
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "백엔드 방 생성 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Next.js POST Proxy Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}