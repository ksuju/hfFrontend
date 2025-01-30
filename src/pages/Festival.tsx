import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';

// API 응답 데이터 타입 정의
interface FestivalPost {
  festivalId: string;
  festivalName: string;
  festivalStartDate: string;
  festivalEndDate: string;
  festivalUrl: string;
  festivalArea: string;
}

const Festival = () => {
  const [searchPosts, setSearchPosts] = useState<FestivalPost[]>([]); // 명확한 타입 적용
  const visibleCount = 15; // useState 없이 직접 값 사용

  // 축제 데이터 가져오기
  const fetchFestivalPosts = async () => {
    try {
      const response = await fetch("http://localhost:8090/api/v1/posts/all");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: FestivalPost[] = await response.json(); // 명확한 타입 적용
      console.log("Fetched Festival Posts:", data);
      setSearchPosts(data);
    } catch (error) {
      console.error("Error fetching festival posts:", error);
    }
  };

  useEffect(() => {
    fetchFestivalPosts();
  }, []);

  // 검색 기능 (추후 구현 가능)
  const handleSearch = async (/*keyword: string*/) => {
    try {
      // const response = await fetch(`/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&type=festival`);
      // const data = await response.json();
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    }
  };

  return (
      <div className="max-w-[600px] mx-auto">
        {/* 검색창 */}
        <SearchBar placeholder="축제/공연을 검색해보세요" onSearch={handleSearch} />

        <div className="p-4 my-20">
          {searchPosts.length === 0 ? (
              <p className="text-center text-gray-500">No festivals available.</p>
          ) : (
              <div className="grid grid-cols-3 gap-3">
                {searchPosts.slice(0, visibleCount).map((searchPost) => (
                    <div key={searchPost.festivalId} className="bg-white rounded-lg shadow-md overflow-hidden">
                      {/* 이미지 영역 */}
                      <div className="relative pb-[85%]">
                        <img
                            src={searchPost.festivalUrl || "https://via.placeholder.com/150"}
                            alt={searchPost.festivalName}
                            className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                        />
                      </div>
                      {/* 텍스트 영역 */}
                      <div className="p-2">
                        <h3 className="text-sm font-medium leading-tight line-clamp-2">
                          {searchPost.festivalName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{searchPost.festivalArea}</p>
                        <p className="text-xs text-gray-500">
                          {searchPost.festivalStartDate?.slice(5)}~{searchPost.festivalEndDate?.slice(5)}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default Festival;
