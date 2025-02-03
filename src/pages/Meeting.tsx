// Meeting.tsx
import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';

interface MeetingPost {
  memberId: string;
  chatRoomId: string;
  roomTitle: string;
  roomContent: string;
  festivalName: string;
  roomMemberLimit: string;
  joinMemberNum: string;
  createDate: string;
}

// API 응답 전체 구조
interface MeetingApiResponse {
    content: MeetingPost[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

const Meeting = () => {
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        setPage(0);
        setHasMore(true);
    };

    // 모임 데이터 가져오기 (무한 스크롤)
    const fetchMeetingPosts = async (pageNumber: number, keyword = "") => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const url = keyword
                ? import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms/search?keyword=${encodeURIComponent(keyword)}&page=${pageNumber}&size=10`
                : import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms?page=${pageNumber}&size=10`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: MeetingApiResponse = await response.json();

            setMeetingPosts((prev) => (pageNumber === 0 ? data.content : [...prev, ...data.content]));
            setHasMore(data.page.number + 1 < data.page.totalPages);
            setPage(data.page.number + 1);
        } catch (error) {
            console.error("Error fetching meeting posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 검색어 변경 시 자동 검색 (디바운스 적용)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMeetingPosts(0, searchKeyword);
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    // 무한 스크롤 이벤트 리스너
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
                fetchMeetingPosts(page, searchKeyword);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, isLoading, searchKeyword]);

  return (
      <div className="max-w-[600px] mx-auto">
        <SearchBar
            placeholder="모임을 검색해보세요"
            onChange={handleSearch}
        />
        <div className="p-4 my-20">
          <div className="space-y-3">
            {meetingPosts.map((meeting) => (
                <div
                    key={meeting.chatRoomId}
                    className="bg-white rounded-lg shadow-md p-4 border border-gray-100"
                >
                    {/* 제목 + 인원수 */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-base flex-grow truncate max-w-[75%]">
                            {meeting.roomTitle}
                        </h3>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                            {meeting.joinMemberNum}/{meeting.roomMemberLimit}명
                        </div>
                    </div>

                    {/* 내용 */}
                    <p className="text-sm text-gray-500 mt-1 truncate max-w-full">
                        {meeting.roomContent}
                    </p>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        {/* 생성 날짜 */}
                        <p>{new Date(meeting.createDate).toISOString().slice(0, 10).replace(/-/g, '.')}</p>
                        {/* 축제 이름 */}
                        <p className="ml-2 text-xs text-gray-500">{meeting.festivalName}</p>
                    </div>
                </div>
            ))}
          </div>
            {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
        </div>
      </div>
  );
};

export default Meeting