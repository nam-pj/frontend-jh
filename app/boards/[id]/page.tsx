interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardDetailPage({
  params,
}: Props) {

  const { id } = await params;

  // 백엔드 호출
  const response = await fetch(
    `http://localhost:8080/api/boards/${id}`,
    {
      cache: "no-store",
    }
  );

  // 데이터 변환
  const board = await response.json();

  return (
    <div className="max-w-3xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-5">
        {board.title}
      </h1>

      <div className="border border-gray-200 rounded-xl p-6 shadow-sm">

        <p className="text-gray-700 whitespace-pre-wrap mb-5">
          {board.content}
        </p>

        <span className="text-sm text-gray-400">
          작성자: {board.username}
        </span>

      </div>

    </div>
  );
}