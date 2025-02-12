import 'swiper/css';
import 'swiper/css/pagination';
import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import MainBanner from '../components/MainBanner';
import SubBanner from '../components/SubBanner.tsx';
import axios from "axios";
import MeetingActionButton from '../components/MeetingActionButton';
import MeetingStatusBadge from '../components/MeetingStatusBadge';
import MeetingMemberCount from '../components/MeetingMemberCount';
import MeetingHeader from '../components/MeetingHeader';
import MeetingContent from '../components/MeetingContent';

// 게시글 데이터 타입 정의
interface Festival {
    festivalId: string;
    festivalName: string;
    festivalStartDate: string;
    festivalEndDate: string;
    festivalUrl: string;
    festivalArea: string;
}

// API 응답 전체 구조
interface FestivalApiResponse {
    content: Festival[];
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

// 사용할 장르 목록
// const genres = [
//     "축제",
//     "뮤지컬",
//     "연극",
//     "서커스/마술",
//     "대중음악",
//     "한국음악(국악)",
//     "서양음악(클래식)"
// ];

const eventList = [
    "곧 종료될 축제 / 공연",
    "곧 시작될 축제 / 공연"
];

interface MeetingPost {
    memberId: string;
    chatRoomId: string;
    roomTitle: string;
    roomContent: string;
    festivalName: string;
    roomMemberLimit: string;
    joinMemberNum: string;
    createDate: string;
    joinMemberIdNickNameList: string[][];
    waitingMemberIdNickNameList: string[][];
}

interface Member {
    id: string;
    joinRoomIdList: string[];
    waitRoomIdList: string[];
}

// API 응답 전체 구조
interface MeetingApiResponse {
    content: MeetingPost[];
}

const Main = () => {
    const [mainPosts, setMainPosts] = useState<Festival[]>([]);
    const [eventBannerData, setEventBannerData] = useState<Festival[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [searchPosts, setSearchPosts] = useState<Festival[]>([]);
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const currentUserID = currentUser?.id ?? "";

    const userInfo: string | null = localStorage.getItem("userInfo")
    const userLocation = userInfo
        ? JSON.parse(userInfo)?.data?.location?.split(" ")[0] ?? "서울"
        : "서울";

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        setIsSearching(keyword.length > 0);
    };

    const fetchMainPosts = async () => {
        try {
            let url: string = "";

            url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/main1?area=${userLocation}`;

            const main1Response = await axios.get<Festival[]>(url);
            setMainPosts(main1Response.data);
        } catch (error) {
            console.error('Error fetching main festival data:', error);
        }
    };

    const fetchEventPosts = async () => {
        const getEventData: Festival[][] = [];
        try {
            const [main2Response, main3Response] = await Promise.all([
                axios.get<Festival[]>(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/main2`),
                axios.get<Festival[]>(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/main3`)
            ]);

            getEventData[0] = main2Response.data;
            getEventData[1] = main3Response.data;

            setEventBannerData(getEventData);
        } catch (error) {
            console.error("Error fetching event posts:", error);
            // 에러 발생 시 빈 배열로 설정
            setEventBannerData([[], [], []]);
        } finally {
            setIsLoading(false);
        }// 데이터 로딩 완료 후 로딩 상태 변경
    };

    const fetchFestivalPosts = async (keyword = "") => {
        setIsLoading(true);
        try {
            const url = import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=0&size=9`

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: FestivalApiResponse = await response.json();
            console.log("Fetched Festival Posts:", data); // 👈 여기에서 콘솔 확인

            setSearchPosts(data.content);
        } catch (error) {
            console.error("Error fetching festival posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMeetingPosts = async (keyword = "") => {
        setIsLoading(true);
        try {
            const url = keyword
                ? import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms/search?keyword=${encodeURIComponent(keyword)}&page=$0&size=10`
                : import.meta.env.VITE_CORE_API_BASE_URL + `/api/v1/posts/chat-rooms?page=0&size=10`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: MeetingApiResponse = await response.json();

            setMeetingPosts(data.content);
        } catch (error) {
            console.error("Error fetching meeting posts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchFestivalPosts(searchKeyword);
            fetchMeetingPosts(searchKeyword);
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

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
            await fetchUserInfo();
        } catch (error) {
            console.error("Error toggling chat room participation:", error);
        }
    };

    const isUserInWaitRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId);
        return currentUser?.waitRoomIdList.includes(chatRoomIdStr) || false;
    };

    const isUserInJoinRoom = (chatRoomId: number | string) => {
        const chatRoomIdStr = String(chatRoomId);
        return currentUser?.joinRoomIdList.includes(chatRoomIdStr) || false;
    };

    const handleChatRoomClick = (chatRoomId: string, isUserJoined: boolean) => {
        if (isUserJoined) {
            navigate(`/chat/${chatRoomId}`);
        }
    };

    useEffect(() => {
        fetchMainPosts();
        fetchEventPosts();
        fetchUserInfo();
    }, []);

    const cancelLeaveRoom = () => {
        setIsConfirmLeaveOpen(null);
    };

    const confirmLeaveRoom = async (chatRoomId: string | null) => {
        if (!chatRoomId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/leave-chat-room/${chatRoomId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    }
                }
            );
            if (response.ok) {
                setIsConfirmLeaveOpen(null);
                await fetchUserInfo();
                await fetchMeetingPosts();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="flex flex-col">
            {/* 검색창 */}
            <SearchBar placeholder="축제, 공연, 모임을 검색해보세요" onChange={handleSearch} />
            <div className="px-4 mb-6 mt-20">
                {/* 로딩 중 표시 */}
                {isLoading ? (
                    <div className="text-center text-gray-500 mt-4">Loading...</div>
                ) : (
                    <>
                        {/* 메인 배너 & 장르별 배너 (검색 중이 아닐 때만 표시) */}
                        {!isSearching && (
                            <>
                                <h2 className="text-lg font-bold mb-4">
                                    {userLocation}에서 가장 인기있는 축제/공연
                                </h2>
                                <MainBanner mainPosts={mainPosts} />

                                {eventList.map((eventTitle, index) => (
                                    <SubBanner
                                        key={eventTitle}
                                        title={eventTitle}
                                        posts={eventBannerData[index] || []}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* 축제/공연 검색 섹션 */}
            {isSearching && (
                <>
                    <div className="p-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">축제/공연</h2>
                            <button
                                className="text-sm text-primary"
                                onClick={() => navigate(`/posts`)}
                            >
                                더보기
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {searchPosts.map((searchPost) => (
                                <div key={searchPost.festivalId} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                                    onClick={() => navigate(`/detailposts?id=${encodeURIComponent(searchPost.festivalId)}`)}
                                >
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
                </>
            )}

            {/* 모임 섹션 */}
            <div className="p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">모임</h2>
                    <button
                        className="text-sm text-primary"
                        onClick={() => navigate(`/chatroom`)}
                    >
                        더보기
                    </button>
                </div>
                <div className="space-y-6">
                    {meetingPosts.map((meeting) => {
                        const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                        const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);

                        return (
                            <div
                                key={meeting.chatRoomId}
                                className={`bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 ${
                                    isUserJoined ? 'border-primary/20 hover:border-primary' : 'border-gray-100'
                                }`}
                                onClick={(e) => {
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    setExpandedId(expandedId === meeting.chatRoomId ? null : meeting.chatRoomId);
                                }}
                            >
                                <div className={`p-6 transition-all duration-300 ${
                                    expandedId === meeting.chatRoomId ? 'min-h-[300px]' : ''
                                }`}>
                                    <MeetingHeader
                                        festivalName={meeting.festivalName}
                                        createDate={meeting.createDate}
                                        isUserJoined={isUserJoined}
                                    />

                                    <MeetingContent
                                        title={meeting.roomTitle}
                                        content={meeting.roomContent}
                                        isExpanded={expandedId === meeting.chatRoomId}
                                    />

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <MeetingMemberCount
                                                joinMemberNum={meeting.joinMemberNum}
                                                roomMemberLimit={meeting.roomMemberLimit}
                                            />
                                            <MeetingStatusBadge 
                                                isUserJoined={isUserJoined}
                                                isUserWaiting={isUserWaiting}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <MeetingActionButton
                                                isUserJoined={isUserJoined}
                                                isUserWaiting={isUserWaiting}
                                                currentUserID={currentUserID}
                                                chatRoomId={meeting.chatRoomId}
                                                handleChatRoomClick={handleChatRoomClick}
                                                handleJoinClick={handleJoinClick}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>

            {/* 나가기 최종확인 팝업창 */}
            {isConfirmLeaveOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-md w-80">
                        <h3 className="text-lg font-semibold mb-8">정말 모임을 떠나시겠어요?</h3>
                        <div className="flex justify-end space-x-10">
                            <button
                                className=" text-primary rounded-lg"
                                onClick={cancelLeaveRoom}>
                                취소
                            </button>
                            <button
                                className="text-primary rounded-lg"
                                onClick={() => confirmLeaveRoom(isConfirmLeaveOpen)}>
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
