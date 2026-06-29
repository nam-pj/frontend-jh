import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

  const { username, password } = await request.json();

  try {

    const response = await fetch("http://localhost:8080/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "로그인 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const token = data.token;

    const res = NextResponse.json({ message: "로그인 성공" });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // username은 민감 정보가 아니라서 httpOnly 없이 저장 (Header에서 클라이언트로도 읽을 수 있게)
    res.cookies.set("username", username, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { message: "서버 오류" },
      { status: 500 }
    );
  }
}