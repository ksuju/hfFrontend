import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import {useSearchParams} from "react-router-dom";

// API 응답 데이터 타입 정의
interface FestivalPost {
  festivalId: string;
  festivalName: string;
  festivalStartDate: string;
  festivalEndDate: string;
  festivalUrl: string;
  festivalArea: string;
}

// API 응답 전체 구조
interface FestivalApiResponse {
  content: FestivalPost[];
  page: {
    totalPages: number;
    number: number; // 현재 페이지 (0부터 시작)
  };
}

const Festival = () => {
  const [searchParams] = useSearchParams();
  const selectedGenre = searchParams.get("genre") || ""; // 기본값 "축제"
  const [searchPosts, setSearchPosts] = useState<FestivalPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
  const [page, setPage] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");

  // 축제 데이터 가져오기 (페이지 스크롤링 기준 요청)
  const fetchFestivalPosts = async (pageNumber: number, keyword = "") => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const url = keyword
          ? `http://localhost:8090/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=15`
          : `http://localhost:8090/api/v1/posts/select?genre=${encodeURIComponent(selectedGenre)}&page=${pageNumber}&size=15`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: FestivalApiResponse = await response.json();
      console.log("Fetched Festival Posts:", data); // 👈 여기에서 콘솔 확인

      setSearchPosts((prev) => (pageNumber === 0 ? data.content : [...prev, ...data.content]));
      setHasMore(data.page.number + 1 < data.page.totalPages);
      setPage(data.page.number + 1);
    } catch (error) {
      console.error("Error fetching festival posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 자동 검색 (디바운스 적용)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFestivalPosts(0, searchKeyword);
    }, 100); // 100ms 디바운스 적용

    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  // 검색 실행 함수
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPage(0);
    setHasMore(true);
  };

  // 무한 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
        fetchFestivalPosts(page, searchKeyword);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, isLoading, searchKeyword]);

  return (
      <div className="max-w-[600px] mx-auto">
        {/* 검색창 */}
        <SearchBar placeholder="축제, 공연을 검색해보세요" onChange={handleSearch} />
        <div className="p-4 my-20">
          <div className="grid grid-cols-3 gap-3">
            {searchPosts.map((searchPost) => (
                <div key={searchPost.festivalId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  {/* 이미지 영역 */}
                  <div className="relative pb-[90%]">
                    <img
                        src={searchPost.festivalUrl || "https://via.placeholder.com/150"}
                        alt={searchPost.festivalName}
                        className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                    />
                  </div>
                  {/* 텍스트 영역 */}
                  <div className="p-2">
                    <h3 className="text-sm font-medium leading-tight line-clamp-2">{searchPost.festivalName}</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-[-10px]">{searchPost.festivalArea}</p>
                  </div>
                  {/* 날짜 영역을 카드 하단에 고정 */}
                  <div className="p-2 text-xs text-gray-500 bg-white mt-auto">
                    <p>
                      {searchPost.festivalStartDate?.replace(/-/g, '.')} - {searchPost.festivalEndDate?.replace(/-/g, '.')}
                    </p>
                  </div>
                </div>
            ))}
          </div>
          {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
        </div>
      </div>
  );
};

export default Festival;
