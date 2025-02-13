import 'swiper/css';
import 'swiper/css/pagination';
import SearchBar from '../components/SearchBar';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import dots from "../assets/images/three-dots.png";
import MainBanner from '../components/MainBanner';
import SubBanner from '../components/SubBanner.tsx';
import axios from "axios";

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
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const navigate = useNavigate(); // 👈 페이지 이동 함수
    const [searchPosts, setSearchPosts] = useState<Festival[]>([]);
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [openPopupId, setOpenPopupId] = useState<string | null>(null);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState<string | null>(null);
    const [isManagePopupOpen, setIsManagePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editRoomData, setEditRoomData] = useState({ title: "", content: "", limit: 10, });
    const [activeTab, setActiveTab] = useState("참여자");
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const selectedMeeting = meetingPosts.find(meeting => meeting.chatRoomId === selectedRoomId);
    const currentUserID = currentUser?.id ?? ""; // 기본값을 빈 문자열로 설정하여 undefined 방지
    const [isConfirmDelegateOpen, setIsConfirmDelegateOpen] = useState(false);
    const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
    const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
    const [isConfirmKickOpen, setIsConfirmKickOpen] = useState(false);
    const [kickTargetId, setKickTargetId] = useState<string | null>(null);
    const [kickChatRoomId, setKickChatRoomId] = useState<string | null>(null);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

    const userInfo: string | null = localStorage.getItem("userInfo");
    const userLocation = userInfo
        ? JSON.parse(userInfo)?.data?.location?.split(" ")[0] ?? "서울"
        : "서울";

    const handleTogglePopup = (chatRoomId: string) => {
        setOpenPopupId(openPopupId === chatRoomId ? null : chatRoomId);
    };

    const handleSearch = async (keyword: string) => {
        setSearchKeyword(keyword);
        setIsSearching(keyword.length > 0);
    };

    const fetchMainPosts = async () => {
        try {
            let url: string = "";

            if (userInfo === null || userInfo === undefined) {
                url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/main1?area=`;
            } else {
                url = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search/main1?area=${JSON.parse(userInfo).data.location}`;
            }

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
            setEventBannerData([[], [], []]);
        } finally {
            setIsLoading(false);
        }
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
            console.log("Fetched Festival Posts:", data);

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

    const handleManageMembers = (chatRoomId: string) => {
        setSelectedRoomId(chatRoomId);
        console.log(selectedRoomId);
        setIsManagePopupOpen(true);
    };

    const closeManagePopup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsManagePopupOpen(false);
        setSelectedRoomId(null);
    };

    const handleEditRoom = (chatRoomId: string) => {
        const selectedRoom = meetingPosts.find((room) => room.chatRoomId === chatRoomId);
        if (selectedRoom) {
            setSelectedRoomId(chatRoomId);
            setEditRoomData({
                title: selectedRoom.roomTitle,
                content: selectedRoom.roomContent,
                limit: Number(selectedRoom.roomMemberLimit),
            });
            setIsEditPopupOpen(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditRoomData((prev) => ({
            ...prev,
            [name]: name === "limit" ? Number(value) : value,
        }));
    };

    const handleSaveEdit = async (chatRoomId: string) => {
        const requestBody = {
            roomTitle: editRoomData.title,
            roomContent: editRoomData.content,
            roomMemberLimit: Number(editRoomData.limit),
        };

        console.log("🔍 요청 데이터:", JSON.stringify(requestBody, null, 2));
        console.log("📌 요청 URL:", `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/update-chat-room/${chatRoomId}`);
        console.log(chatRoomId);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/update-chat-room/${chatRoomId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            if (!response.ok) {
                throw new Error("채팅방 수정 실패");
            }
            console.log("채팅방 수정 성공");
            setIsEditPopupOpen(false);
            await fetchMeetingPosts();
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

    const handleLeaveRoom = (chatRoomId: string) => {
        console.log(`나가기: ${chatRoomId}`);
        setIsConfirmLeaveOpen(chatRoomId);
        setOpenPopupId(null);
    };

    const confirmLeaveRoom = async (chatRoomId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/leave-chat-room/${chatRoomId}`, {
                method: 'GET',
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                console.log('Successfully left the chat room');
                setIsConfirmLeaveOpen(null);
                await fetchUserInfo();
                await fetchMeetingPosts();
            } else {
                console.error('Error leaving chat room');
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    const cancelLeaveRoom = () => {
        setIsConfirmLeaveOpen(null);
    };

    const getNicknameById = (id: string | null) => {
        const member = selectedMeeting?.joinMemberIdNickNameList.find(([memberId]) => memberId === id);
        return member ? member[1] : "알 수 없음";
    };

    const sortedJoinMembers = selectedMeeting ? (() => {
        const ownerIndex = selectedMeeting.joinMemberIdNickNameList.findIndex(([id]) => id === String(currentUserID));
        if (ownerIndex !== -1) {
            const sortedList = [
                selectedMeeting.joinMemberIdNickNameList[ownerIndex],
                ...selectedMeeting.joinMemberIdNickNameList.filter((_, idx) => idx !== ownerIndex)
            ];
            return sortedList;
        }
        return selectedMeeting.joinMemberIdNickNameList;
    })() : [];

    const handleConfirmDelegate = (chatRoomId: string, memberId: string) => {
        setSelectedChatRoomId(chatRoomId);
        setSelectedDelegateId(memberId);
        setIsConfirmDelegateOpen(true);
    };

    const confirmDelegate = () => {
        if (selectedChatRoomId && selectedDelegateId) {
            handleDelegate(selectedChatRoomId, selectedDelegateId);
        }
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    const handleDelegate = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/delegate-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                setIsManagePopupOpen(false);
                await fetchMeetingPosts();
            } else {
                alert("위임에 실패했습니다.");
            }
        } catch (error) {
            console.error("위임 요청 실패:", error);
        }
    };

    const cancelDelegate = () => {
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    const handleConfirmKick = (chatRoomId: string, memberId: string) => {
        setKickChatRoomId(chatRoomId);
        setKickTargetId(memberId);
        setIsConfirmKickOpen(true);
    };

    const confirmKick = async () => {
        if (!kickChatRoomId || !kickTargetId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/unqualify-chat-room/${kickChatRoomId}/${kickTargetId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                await fetchMeetingPosts();
            } else {
                alert("강퇴에 실패했습니다.");
            }
        } catch (error) {
            console.error("강퇴 요청 실패:", error);
        }
        setIsConfirmKickOpen(false);
    };

    const cancelKick = () => {
        setIsConfirmKickOpen(false);
        setKickTargetId(null);
        setKickChatRoomId(null);
    };

    const handleApprove = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/approve-apply-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                await fetchMeetingPosts();
            } else {
                alert("승인에 실패했습니다.");
            }
        } catch (error) {
            console.error("승인 요청 실패:", error);
        }
    };

    const handleRefuse = async (chatRoomId: string, memberId: string) => {
        if (!chatRoomId || !memberId) return;
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/refuse-apply-chat-room/${chatRoomId}/${memberId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.ok) {
                await fetchMeetingPosts();
            } else {
                alert("거절에 실패했습니다.");
            }
        } catch (error) {
            console.error("거절 요청 실패:", error);
        }
    };

    const handleCardClick = (chatRoomId: string) => {
        setExpandedPostId(expandedPostId === chatRoomId ? null : chatRoomId);
    };

    return (
        <div className="flex flex-col">
            {/* 검색창 */}
            <SearchBar placeholder="축제, 공연, 모임을 검색해보세요" onChange={handleSearch} />
            <div className="px-4 mb-6 mt-20">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{userLocation}에서 모임이 가장 많은 축제예요!</h2>
                </div>
                {/* 로딩 중 표시 */}
                {isLoading ? (
                    <div className="text-center text-gray-500 mt-4">Loading...</div>
                ) : (
                    <>
                        {/* 메인 배너 & 장르별 배너 (검색 중이 아닐 때만 표시) */}
                        {!isSearching && (
                            <>
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

                        {searchPosts && searchPosts.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {searchPosts.map((searchPost) => (
                                    <div
                                        key={searchPost.festivalId}
                                        className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
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
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">검색된 축제 / 공연이 없습니다</p>
                            </div>
                        )}
                        {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
                    </div>
                </>
            )}

            {/* 모임 채팅방 섹션 */}
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
                {meetingPosts && meetingPosts.length > 0 ? (
                    <div className="space-y-3">
                        {meetingPosts.map((meeting) => {
                            const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                            const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);
                            const isRoomOwner = meeting.memberId === currentUser?.id;

                            return (
                                <div
                                    key={meeting.chatRoomId}
                                    className="bg-white rounded-lg p-4 border border-gray-100 shadow-md hover:border-[#FF6B36] transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleCardClick(meeting.chatRoomId)}
                                >
                                    {/* 토요명품 표시 */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className={`inline-block text-xs px-3 py-1 rounded-full ${isUserJoined
                                            ? "bg-green-50 text-green-500"
                                            : "bg-[#FFF4F1] text-[#FF6B36]"
                                            }`}>
                                            {meeting.festivalName}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <p>{new Date(meeting.createDate).toISOString().slice(0, 10).replace(/-/g, ".")}</p>
                                            {/* 팝업 메뉴 (점 세개) */}
                                            {isUserJoined && (
                                                <div className="relative">
                                                    <div className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 ml-2 border border-gray-200">
                                                        <img
                                                            src={dots}
                                                            alt="사이드바"
                                                            className="h-5 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTogglePopup(meeting.chatRoomId);
                                                            }}
                                                        />
                                                    </div>
                                                    {/* 팝업 메뉴 */}
                                                    {openPopupId === meeting.chatRoomId && (
                                                        <div
                                                            className="absolute right-0 top-8 bg-white shadow-md rounded-lg border border-gray-200 w-20 text-sm z-10"
                                                            onClick={(e) => e.stopPropagation()}
                                                            onBlur={() => setOpenPopupId(null)}
                                                            tabIndex={0}
                                                        >
                                                            {isRoomOwner && (
                                                                <>
                                                                    <button
                                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-black"
                                                                        onClick={() => handleManageMembers(meeting.chatRoomId)}
                                                                    >
                                                                        인원 관리
                                                                    </button>
                                                                    <button
                                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-black"
                                                                        onClick={() => handleEditRoom(meeting.chatRoomId)}
                                                                    >
                                                                        수정하기
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-primary"
                                                                onClick={() => handleLeaveRoom(meeting.chatRoomId)}
                                                            >
                                                                나가기
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 제목 */}
                                    <h3 className="font-medium text-base mb-2 truncate max-w-[75%]">
                                        {meeting.roomTitle}
                                    </h3>

                                    {/* 내용 */}

                                    <p className={`text-sm text-gray-500 mb-6 ${expandedPostId === meeting.chatRoomId
                                        ? ""
                                        : "truncate"
                                        } max-w-full`}>
                                        {meeting.roomContent}
                                    </p>

                                    {/* 하단 정보 */}
                                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                        <div className="flex items-center gap-2">
                                            {/* 참여 인원 */}

                                            <div className="flex items-center gap-1 text-gray-500">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                    />
                                                </svg>
                                                <span>{meeting.joinMemberNum}/{meeting.roomMemberLimit}</span>
                                            </div>

                                            {/* 프로그레스 바 */}
                                            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-500"
                                                    style={{
                                                        width: `${(Number(meeting.joinMemberNum) / Number(meeting.roomMemberLimit)) * 100}%`
                                                    }}
                                                />
                                            </div>

                                            {/* 참여중 표시 */}
                                            {isUserJoined && (
                                                <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                                                    참여중
                                                </span>
                                            )}
                                        </div>

                                        {/* 참여하기/입장하기 버튼 */}
                                        {isUserJoined ? (
                                            <button
                                                className="text-sm font-medium px-3 py-1 rounded-full bg-[#FF6B36] text-white hover:bg-[#FF855B] transition-colors duration-200"
                                                onClick={() => handleChatRoomClick(meeting.chatRoomId, true)}
                                            >
                                                입장하기
                                            </button>
                                        ) : (
                                            <button
                                                className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors duration-200 ${isUserWaiting
                                                    ? "text-gray-500 border-gray-400 hover:bg-gray-100"
                                                    : "text-[#FF6B36] border border-[#FF6B36] hover:bg-[#FFF4F1]"
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (currentUserID == "") {
                                                        alert("로그인이 필요합니다.");
                                                        return;
                                                    }
                                                    handleJoinClick(meeting.chatRoomId, isUserWaiting);
                                                }}
                                            >
                                                {isUserWaiting ? "취소" : "참여하기"}
                                            </button>
                                        )}
                                    </div>

                                    {/* 인원관리 팝업창 */}
                                    {isManagePopupOpen && (
                                        <div
                                            className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
                                            onClick={(e) => e.stopPropagation()} // 팝업 외부 클릭 방지
                                        >
                                            <div className="bg-white w-2/3 h-3/4 p-6 rounded-lg shadow-md flex flex-col">
                                                <h3 className="text-lg font-semibold mb-4">인원 관리</h3>
                                                {/* 메뉴바 */}
                                                <div className="flex border-b">
                                                    {[
                                                        { label: "참여자", count: sortedJoinMembers.length },
                                                        { label: "대기자", count: selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0 },
                                                    ].map(({ label, count }) => (
                                                        <button
                                                            key={label}
                                                            className={`flex-1 p-2 text-center text-lg font-medium ${activeTab === label ? "border-b-2 border-primary text-primary" : "text-gray-500"
                                                                }`}
                                                            onClick={() => setActiveTab(label)}
                                                        >
                                                            {`${label} ${count}`}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* 내용 */}
                                                <div className="flex-grow overflow-y-auto p-4">
                                                    {activeTab === "참여자" ? (
                                                        <ul>
                                                            {sortedJoinMembers.map(([id, nickname], index) => (
                                                                <li key={id} className="p-2 border-b flex items-center w-full">
                                                                    {index === 0 ? (
                                                                        <svg
                                                                            className="w-6 h-6 mr-2 text-yellow-500"
                                                                            fill="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19H5V21H19V19Z" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg
                                                                            className="w-6 h-6 mr-2 text-gray-400"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    <span>{nickname}</span>
                                                                    {index !== 0 && (
                                                                        <div className="ml-auto flex space-x-4">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleConfirmDelegate(selectedMeeting?.chatRoomId ?? '', id);
                                                                                }}
                                                                                className="text-primary hover:bg-[#FFF4F1] px-2 py-1 rounded-md transition-colors duration-200"
                                                                            >
                                                                                위임
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleConfirmKick(selectedMeeting?.chatRoomId ?? '', id);
                                                                                }}
                                                                                className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200"
                                                                            >
                                                                                강퇴
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <ul>
                                                            {(selectedMeeting?.waitingMemberIdNickNameList?.length ?? 0) > 0 ? (
                                                                selectedMeeting?.waitingMemberIdNickNameList.map(([id, nickname]) => (
                                                                    <li key={id} className="p-2 border-b flex items-center w-full">
                                                                        <span>{nickname}</span>
                                                                        <div className="ml-auto flex space-x-4">
                                                                            <button
                                                                                className="text-primary hover:bg-[#FFF4F1] px-2 py-1 rounded-md transition-colors duration-200"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleApprove(selectedMeeting?.chatRoomId ?? '', id);
                                                                                }}
                                                                            >
                                                                                승인
                                                                            </button>
                                                                            <button
                                                                                className="text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRefuse(selectedMeeting?.chatRoomId ?? '', id);
                                                                                }}
                                                                            >
                                                                                거절
                                                                            </button>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <p className="text-center text-gray-500">대기자가 없습니다.</p>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>

                                                {/* 닫기 버튼 */}
                                                <div className="text-right mt-4">
                                                    <button className="px-4 py-2 text-primary rounded-lg" onClick={(e) => closeManagePopup(e)}>
                                                        닫기</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }

                                    {/* 수정하기 팝업 */}
                                    {isEditPopupOpen && (
                                        <div className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-20"
                                            onClick={(e) => e.stopPropagation()}>
                                            <div className="bg-white w-2/3 h-4/7 p-6 rounded-lg shadow-md flex flex-col">
                                                <h3 className="text-lg font-semibold mb-4">채팅방 수정</h3>

                                                <label className="block mb-2">
                                                    제목
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={editRoomData.title}
                                                        onChange={handleChange}
                                                        maxLength={100}
                                                        className="w-full border p-2 rounded mt-1"
                                                    />
                                                </label>

                                                <label className="block mb-2">
                                                    내용
                                                    <textarea
                                                        name="content"
                                                        value={editRoomData.content}
                                                        onChange={handleChange}
                                                        maxLength={500}
                                                        className="w-full border p-2 rounded mt-1 h-32"
                                                    />
                                                </label>

                                                <label className="block mb-4">
                                                    인원 제한
                                                    <select
                                                        name="limit"
                                                        value={editRoomData.limit}
                                                        onChange={handleChange}
                                                        className="w-full border p-2 rounded mt-1 mb-2"
                                                    >
                                                        {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((num) => (
                                                            <option key={num} value={num}>{num}명</option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <div className="flex justify-end space-x-4">
                                                    <button className="pl-4 py-2 text-primary" onClick={() => setIsEditPopupOpen(false)}>취소</button>
                                                    <button className="pl-4 py-2 text-primary" onClick={() => handleSaveEdit(selectedMeeting?.chatRoomId ?? '')}>
                                                        저장
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">검색된 모임이 없습니다</p>
                    </div>
                )}
                {isLoading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
            </div>

            {/* 나가기 최종확인 팝업창 */}
            {
                isConfirmLeaveOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 rounded-lg shadow-md w-80">
                            <h3 className="text-lg font-semibold mb-8">정말 모임을 떠나시겠어요?</h3>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="text-gray-500 rounded-lg hover:bg-gray-100 px-3 py-1 transition-colors duration-200"
                                    onClick={cancelLeaveRoom}>
                                    취소
                                </button>
                                <button
                                    className="text-red-500 rounded-lg hover:bg-red-50 px-3 py-1 transition-colors duration-200"
                                    onClick={() => confirmLeaveRoom(isConfirmLeaveOpen)}>
                                    나가기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 위임하기 최종확인 팝업창 */}
            {
                isConfirmDelegateOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 rounded-lg shadow-md w-80">
                            <h3 className="text-lg font-semibold mb-8">
                                <span className="text-primary">{getNicknameById(selectedDelegateId)}</span>님에게 방장권한을 위임하시겠어요?
                            </h3>
                            <div className="flex justify-end space-x-10">
                                <button className="text-primary rounded-lg" onClick={cancelDelegate}>
                                    취소
                                </button>
                                <button className="text-gray-500 rounded-lg" onClick={confirmDelegate}>
                                    위임하기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 강퇴하기 최종확인 팝업창 */}
            {
                isConfirmKickOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
                        <div className="bg-white p-6 rounded-lg shadow-md w-80">
                            <h3 className="text-lg font-semibold mb-8">
                                <span className="text-primary">{getNicknameById(kickTargetId)}</span>님을 강퇴하시겠어요?
                            </h3>
                            <div className="flex justify-end space-x-10">
                                <button className="text-primary rounded-lg" onClick={cancelKick}>
                                    취소
                                </button>
                                <button className="text-gray-500 rounded-lg" onClick={confirmKick}>
                                    강퇴하기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Main;
