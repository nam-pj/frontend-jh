import { NextResponse } from "next/server";

export async function POST() {

  const res = NextResponse.json({ message: "로그아웃 되었습니다." });

  res.cookies.delete("token");
  res.cookies.delete("username");

  return res;
}