import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import { useNavigate } from "react-router-dom";
import MeetingActionButton from '../components/MeetingActionButton';
import MeetingStatusBadge from '../components/MeetingStatusBadge';
import MeetingMemberCount from '../components/MeetingMemberCount';
import MeetingHeader from '../components/MeetingHeader';
import MeetingContent from '../components/MeetingContent';

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

interface MeetingApiResponse {
    content: MeetingPost[];
    page: {
        totalPages: number;
        number: number;
    };
}

const Meeting = () => {
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const currentUserID = currentUser?.id ?? "";

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        setPage(0);
        setHasMore(true);
    };

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

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMeetingPosts(0, searchKeyword);
        }, 100);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading) {
                fetchMeetingPosts(page);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, isLoading]);

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

    return (
        <div className="max-w-[1280px] mx-auto">
            <div className="px-4 py-8">
                <div className="max-w-[600px] mx-auto">
                    <div className="flex flex-col gap-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mt-16">모임</h2>
                        <SearchBar 
                            placeholder="모임을 검색해보세요" 
                            onChange={handleSearch} 
                            showSearchType={false}
                        />
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
            </div>
        </div>
    );
};

export default Meeting;