"use client";

export default function LogoutButton() {

  const handleLogout = async () => {

    await fetch("/api/logout", { method: "POST" });

    alert("로그아웃 되었습니다.");

    window.location.href = "/";
  };

  return (
    <button
      onClick={handleLogout}
      className="hover:text-red-500 transition-colors"
    >
      로그아웃
    </button>
  );
};