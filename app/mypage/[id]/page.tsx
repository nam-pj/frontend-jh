import { cookies } from "next/headers";

interface Props {
  params: Promise<{
    name: string;
  }>;
}

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

interface UserResponse {
  username: string;
}

function decodeJwtPayload(token: string): JwtPayload {
  const payload = token.split(".")[1];
  const decoded = Buffer.from(payload, "base64").toString("utf-8");
  return JSON.parse(decoded);
}

export default async function MyPage({
  params,
}: Props) {

  const { name } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-500">
          로그인이 필요합니다.
        </h1>
      </div>
    );
  }

   const { sub: id } = decodeJwtPayload(token);

  // const response = await fetch(
  //   `http://localhost:8080/user/${name}`,
  //   {
  //     cache: "no-store",
  //   }
  // );

  // if (!response.ok) {
  //   return (
  //     <div className="p-10">
  //       <h1 className="text-2xl font-bold text-red-500">
  //         유저 정보를 불러올 수 없습니다.
  //       </h1>
  //     </div>
  //   );
  // }

  //const data: UserResponse = await response.json();

  const user = {
    id,
    //username: data.username,
  };

  return (
    <div className="max-w-5xl mx-auto p-10">

      <div className="mb-16">
        <h1 className="text-6xl font-bold">마이페이지</h1>
      </div>

      <div className="flex flex-col gap-14">

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10">
          <div className="flex items-center gap-10">
            <div className="grid grid-cols-2 gap-x-20 gap-y-8 w-full">
              <div>
                <p className="text-sm text-gray-400 mb-2">아이디</p>
                <p className="text-2xl font-bold">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">유저네임</p>
                {/*<p className="text-2xl font-bold">{user.username}</p>*/}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-md transition cursor-pointer min-h-[220px]">
            <h2 className="text-2xl font-bold mb-4">내가 작성한 게시글</h2>
            <p className="text-gray-500 leading-relaxed">
              내가 작성한 게시글들을
              확인하고 관리할 수 있습니다.
            </p>
          </div>

          <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-md transition cursor-pointer min-h-[220px]">
            <h2 className="text-2xl font-bold mb-4">계정 설정</h2>
            <p className="text-gray-500 leading-relaxed">
              비밀번호 변경 및
              계정 관련 설정을 관리할 수 있습니다.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}