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
  joinMemberIdList: string[];
  joinMemberNum: string;
  waitingMemberIdList: string[];
  createDate: string;
}

interface Member {
    id: string;
    nickname: string;
    email: string;
    joinRoomIdList: string[];
    waitRoomIdList: string[];
    createDate: string;
    gender: string | null;
    birthday: string | null;
    location: string | null;
    phoneNumber: string | null;
    profilePath: string | null;
    socialAccounts: Record<string, string | boolean>;
    loginType: string;
    onlySocialAccount: boolean;
    mkAlarm: boolean;
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
    const [currentUser, setCurrentUser] = useState<Member | null>(null);

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

    // 현재 로그인한 유저 정보 업데이트
    const fetchUserInfo = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_CORE_API_BASE_URL + "/api/v1/auth/me", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: { resultCode: string; msg: string; data: Member } = await response.json();
            console.log('API response data:', data);
            setCurrentUser(data.data);
        } catch (error) {
            console.error("사용자 정보 로드 실패:", error);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    // 참여하기/취소 버튼 로직 구현
    const handleJoinClick = async (chatRoomId: string, isUserWaiting: boolean | undefined) => {
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL +
                (isUserWaiting ? `/api/v1/posts/cancel-apply-chat-room/${chatRoomId}` : `/api/v1/posts/apply-chat-room/${chatRoomId}`);

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // 최신 참여 채팅방 리스트 가져오기
            await fetchUserInfo();

        } catch (error) {
            console.error("Error toggling chat room participation:", error);
        }
    };

    // 유저가 채팅방 대기자 목록에 있는지 확인
    const isUserInWaitRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId); // 문자열 변환
        return currentUser?.waitRoomIdList.includes(chatRoomIdStr) || false;
    };

    // 유저가 이미 참여한 채팅방인지 확인하는 함수
    const isUserInJoinRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId); // 문자열 변환
        return currentUser?.joinRoomIdList.includes(chatRoomIdStr) || false;
    };

    return (
        <div className="max-w-[600px] mx-auto">
            <SearchBar placeholder="모임을 검색해보세요" onChange={handleSearch} />
            <div className="p-4 my-20">
                <div className="space-y-3">
                    {meetingPosts.map((meeting) => {
                        // Check if the currentUserId is in the current user's wait room list
                        const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                        const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);

                        return (
                            <div key={meeting.chatRoomId} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                                {/* 제목 + 버튼 */}
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-base flex-grow truncate max-w-[75%]">
                                        {meeting.roomTitle}
                                    </h3>
                                    {/* 참여 상태 표시 */}                                    {isUserJoined ? (
                                        <span className="text-primary text-xs">●</span>
                                    ) : (
                                        <button
                                            className={`text-sm font-medium px-3 py-1 rounded-md ${
                                                isUserWaiting ? "text-gray-500 border-gray-400" : "text-primary border-primary"
                                            }`}
                                            onClick={() => handleJoinClick(meeting.chatRoomId, isUserWaiting)}
                                        >
                                            {isUserWaiting ? "취소" : "참여하기"}
                                        </button>
                                    )}
                                </div>
                                {/* 내용 */}
                                <p className="text-sm text-gray-500 mt-1 truncate max-w-full">{meeting.roomContent}</p>
                                <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    {/* 생성 날짜 + 축제 이름 */}
                                    <div className="flex items-center">
                                        <p>{new Date(meeting.createDate).toISOString().slice(0, 10).replace(/-/g, ".")}</p>
                                        <p className="ml-2 text-xs text-gray-500">{meeting.festivalName}</p>
                                    </div>
                                    {/* 참여 인원 */}
                                    <div className="text-xs text-gray-500 whitespace-nowrap ml-auto">
                                        {meeting.joinMemberNum}/{meeting.roomMemberLimit}명
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
            </div>
        </div>
    );
};

export default Meeting