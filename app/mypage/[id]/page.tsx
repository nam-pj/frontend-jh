interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function MyPage({
  params,
}: Props) {

  const { id } = await params;

  /*
  // ================================
  // 실제 백엔드 통신 시 사용할 코드
  // ================================

  const response = await fetch(
    `http://localhost:8080/user/${id}`,
    {
      cache: "no-store",
    }
  );

  // 요청 실패 처리
  if (!response.ok) {

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-500">
          유저 정보를 불러올 수 없습니다.
        </h1>
      </div>
    );
  }

  // 백엔드 데이터
  const user = await response.json();
  */

  // ================================
  // 현재 디자인 확인용 임시 데이터
  // ================================
  const user = {
    id: id,
    username: "테스트유저",
  };

  return (
    <div className="max-w-5xl mx-auto p-10">

      {/* 제목 */}
      <div className="mb-16">

        <h1 className="text-6xl font-bold">
          마이페이지
        </h1>

      </div>

      {/* 카드 영역 전체 */}
      <div className="flex flex-col gap-14">

        {/* 프로필 카드 */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10">

          <div className="flex items-center gap-10">

          
            {/* 유저 정보 */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-8 w-full">

              <div>
                <p className="text-sm text-gray-400 mb-2">
                  사용자 번호
                </p>

                <p className="text-2xl font-bold">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">
                  아이디
                </p>

                <p className="text-2xl font-bold">
                  {user.username}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* 추가 메뉴 */}
        <div className="grid grid-cols-2 gap-8">

          {/* 내가 작성한 게시글 */}
          <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-md transition cursor-pointer min-h-[220px]">

            <h2 className="text-2xl font-bold mb-4">
              내가 작성한 게시글
            </h2>

            <p className="text-gray-500 leading-relaxed">
              내가 작성한 게시글들을
              확인하고 관리할 수 있습니다.
            </p>

          </div>

          {/* 계정 설정 */}
          <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-md transition cursor-pointer min-h-[220px]">

            <h2 className="text-2xl font-bold mb-4">
              계정 설정
            </h2>

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