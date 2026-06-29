const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(path: string, options: RequestInit = {}) {

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // 쿠키(token)를 같이 실어 보냄
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
}