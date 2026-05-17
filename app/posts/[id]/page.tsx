interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PostDetailPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-3xl font-bold">
        게시글 {id}
      </h1>

      <p className="mt-5 text-gray-600">
        게시글 상세 페이지입니다.
      </p>
    </div>
  );
}