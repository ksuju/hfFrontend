import {useEffect, useState} from 'react';
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

// API 응답 전체 구조
interface FestivalApiResponse {
    content: FestivalPost[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}


const Festival = () => {
    const [selectedGenre, setSelectedGenre] = useState("전체");
    const [searchPosts, setSearchPosts] = useState<FestivalPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
    const [page, setPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState("축제명+지역");
    // const [searchParams] = useSearchParams();
    // const selectedGenre = searchParams.get("genre") || ""; // 기본값 "축제"

    const genres = [
        "전체",
        "축제",
        "뮤지컬",
        "연극",
        "서커스/마술",
        "대중음악",
        "국악",
        "클래식"
    ];

    // 축제 데이터 가져오기 (페이지 스크롤링 기준 요청)
    const fetchFestivalPosts = async (pageNumber: number, keyword = "") => {
        // JPA 쿼리
        // if (selectedGenre === "전체") {
        //     url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/all?&page=${pageNumber}&size=15`;
        // }else {
        //     url = keyword
        //         ? `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=15`
        //         : `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/select?genre=${encodeURIComponent(selectedGenre)}&page=${pageNumber}&size=15`;
        // }

        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            let url: string = "";
            let where = "";

            // 검색 타입에 따른 where 값 설정
            switch (searchType) {
                case '축제명+지역':
                    where = 'all';
                    break;
                case '축제명':
                    where = 'name';
                    break;
                case '지역':
                    where = 'area';
                    break;
            }

            // 엘라스틱 검색 URL 구성
            if (selectedGenre === "전체") {
                if (keyword === "") {
                    url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/all?page=${pageNumber}&size=15`;
                } else {
                    url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/key?genre=&where=${where}&keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=15`
                }
            } else {
                url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/key?where=${where}&genre=${encodeURIComponent(selectedGenre)}&keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=15`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: FestivalApiResponse = await response.json();

            setSearchPosts((prev) => (pageNumber === 0 ? data.content : [...prev, ...data.content]));
            setHasMore(data.page.number + 1 < data.page.totalPages);
            setPage(data.page.number + 1);
        } catch (error) {
            console.error("Error fetching festival posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenreClick = (genre: string) => {
        if (selectedGenre != genre) {
            setSelectedGenre(genre);
            setPage(0);
            setHasMore(true);
            setSearchPosts([]);
        }
    };

    // 검색어 변경 시 자동 검색 (디바운스 적용)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFestivalPosts(0, searchKeyword);
        }, 100); // 100ms 디바운스 적용

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword, searchType]);

    useEffect(() => {
        fetchFestivalPosts(0, searchKeyword);
    }, [selectedGenre])

    // 검색 실행 함수
    const handleSearch = (keyword: string, newSearchType?: string) => {
        setSearchKeyword(keyword);
        setSearchType(newSearchType ?? "");
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
            <SearchBar placeholder="축제, 공연을 검색해보세요" onChange={handleSearch} showSearchType={true}/>

            <div className="p-4 my-20">
                <div className="flex overflow-x-auto gap-1 pb-4">
                    {genres.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => handleGenreClick(genre)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                selectedGenre === genre
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {searchPosts.map((searchPost) => (
                        <div key={searchPost.festivalId}
                             className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
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
