import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface FestivalDetail {
    festivalId: number;
    festivalName: string;
    festivalUrl: string;
    festivalArea: string;
    festivalStartDate: string;
    festivalEndDate: string;
    description: string;
}

export default function FestivalDetail() {
    const { festivalId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<FestivalDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async (festivalId: string) => {
            try {
                const response = await axios.get(`http://localhost:8090/api/v1/posts/${festivalId}`);
                setPost(response.data);
            } catch (err) {
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [festivalId]);

    if (isLoading) {
        return <div className="text-center text-gray-500 mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (!post) {
        return <div className="text-center text-gray-500 mt-10">게시글이 존재하지 않습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* 뒤로 가기 버튼 */}
            <button onClick={() => navigate(-1)} className="mb-4 text-primary text-sm">
                ← 뒤로가기
            </button>

            {/* 카드 스타일 유지하면서 크기 확대 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* 이미지 영역 */}
                <div className="relative w-full h-[500px] bg-gray-100 flex justify-center items-center">
                    <img
                        src={post.festivalUrl || "https://via.placeholder.com/500"}
                        alt={post.festivalName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 상세 정보 영역 */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold">{post.festivalName}</h1>
                    <p className="text-gray-600 mt-2">{post.festivalArea}</p>

                    {/* 날짜 */}
                    <p className="text-sm text-gray-500 mt-2">
                        {post.festivalStartDate.replace(/-/g, ".")} - {post.festivalEndDate.replace(/-/g, ".")}
                    </p>

                    {/* 설명 */}
                    <p className="text-gray-700 mt-4 whitespace-pre-line">{post.description}</p>
                </div>
            </div>
        </div>
    );
}
