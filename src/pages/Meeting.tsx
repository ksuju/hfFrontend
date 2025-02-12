import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import {useNavigate} from "react-router-dom";
import dots from '../assets/images/three-dots.png';

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
    page: {
        totalPages: number;
        number: number; // 현재 페이지 (0부터 시작)
    };
}

const Meeting = () => {
    const [meetingPosts, setMeetingPosts] = useState<MeetingPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate(); // 페이지 이동을 위한 훅
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [openPopupId, setOpenPopupId] = useState<string | null>(null);
    const [isConfirmLeaveOpen, setIsConfirmLeaveOpen] = useState<string | null>(null);
    const [isManagePopupOpen, setIsManagePopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editRoomData, setEditRoomData] = useState({title: "", content: "", limit: 10,});
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
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleTogglePopup = (chatRoomId: string) => {
        setOpenPopupId(openPopupId === chatRoomId ? null : chatRoomId);
    };

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
                fetchMeetingPosts(page);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, isLoading]);

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

    // 채팅방 클릭 시 이동 메서드
    const handleChatRoomClick = (chatRoomId: string, isUserJoined: boolean) => {
        if (isUserJoined) {
            navigate(`/chat/${chatRoomId}`); // 참여한 채팅방만 이동 가능
        }
    };

    // 인원관리 버튼 메서드
    const handleManageMembers = (chatRoomId: string) => {
        setSelectedRoomId(chatRoomId);
        console.log(selectedRoomId);
        setIsManagePopupOpen(true);
    };

    // 인원관리 창 나가기 메서드
    const closeManagePopup = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsManagePopupOpen(false);
        setSelectedRoomId(null);
    };

    // 수정하기 버튼 메서드
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

    // 수정 폼 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditRoomData((prev) => ({
            ...prev,
            [name]: name === "limit" ? Number(value) : value,
        }));
    };

    // 수정내용 저장하기 버튼 메서드
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
            // 수정하기 후 최신 데이터 다시 불러오기
            await fetchMeetingPosts(0);
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

    // 나가기 버튼 메서드
    const handleLeaveRoom = (chatRoomId: string) => {
        console.log(`나가기: ${chatRoomId}`);
        setIsConfirmLeaveOpen(chatRoomId); // Open confirmation popup
        setOpenPopupId(null);
    };

    // 최종확인 나가기 버튼 메서드
    const confirmLeaveRoom = async (chatRoomId: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/leave-chat-room/${chatRoomId}`, {
                method: 'GET', // Or use the correct method (POST/DELETE)
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                console.log('Successfully left the chat room');
                setIsConfirmLeaveOpen(null); // Close the confirmation popup
                // 나가기 후 최신 데이터 다시 불러오기
                await fetchUserInfo();
                await fetchMeetingPosts(0);
            } else {
                console.error('Error leaving chat room');
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    // 나가기 취소 버튼 메서드
    const cancelLeaveRoom = () => {
        setIsConfirmLeaveOpen(null); // Close the confirmation popup
    };

    // ID로 닉네임 찾기 함수
    const getNicknameById = (id: string | null) => {
        const member = selectedMeeting?.joinMemberIdNickNameList.find(([memberId]) => memberId === id);
        return member ? member[1] : "알 수 없음";
    };

    // 참여자 목록에서 방장위치 맨 위에 고정
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

    // 위임 버튼 클릭 시 확인 팝업 띄우기
    const handleConfirmDelegate = (chatRoomId: string, memberId: string) => {
        setSelectedChatRoomId(chatRoomId);
        setSelectedDelegateId(memberId);
        setIsConfirmDelegateOpen(true);
    };

    // 위임 최종 확인 후 실행
    const confirmDelegate = () => {
        if (selectedChatRoomId && selectedDelegateId) {
            handleDelegate(selectedChatRoomId, selectedDelegateId);
        }
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    // 위임하기 요청 메서드
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
                // 위임 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("위임에 실패했습니다.");
            }
        } catch (error) {
            console.error("위임 요청 실패:", error);
        }
    };

    // 위임 최종확인 팝업 닫기
    const cancelDelegate = () => {
        setIsConfirmDelegateOpen(false);
        setSelectedDelegateId(null);
        setSelectedChatRoomId(null);
    };

    // 강퇴 확인 팝업 열기
    const handleConfirmKick = (chatRoomId: string, memberId: string) => {
        setKickChatRoomId(chatRoomId);
        setKickTargetId(memberId);
        setIsConfirmKickOpen(true);
    };

    // 강퇴 요청 실행
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
                // 강퇴 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("강퇴에 실패했습니다.");
            }
        } catch (error) {
            console.error("강퇴 요청 실패:", error);
        }
        setIsConfirmKickOpen(false);
    };

    // 강퇴 최종확인 팝업 닫기
    const cancelKick = () => {
        setIsConfirmKickOpen(false);
        setKickTargetId(null);
        setKickChatRoomId(null);
    };

    // 대기자 승인하기 요청 메서드
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
                // 승인 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("승인에 실패했습니다.");
            }
        } catch (error) {
            console.error("승인 요청 실패:", error);
        }
    };

    // 대기자 거절하기 요청 메서드
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
                // 거절 후 최신 데이터 다시 불러오기
                await fetchMeetingPosts(0);
            } else {
                alert("거절에 실패했습니다.");
            }
        } catch (error) {
            console.error("거절 요청 실패:", error);
        }
    };

    return (
        <div className="max-w-[1280px] mx-auto">
            <div className="px-4 py-8">
                <div className="max-w-[600px] mx-auto">
                    {/* 헤더 섹션 */}
                    <div className="flex flex-col gap-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mt-16">모임</h2>
                        <SearchBar 
                            placeholder="모임을 검색해보세요" 
                            onChange={handleSearch} 
                            showSearchType={false}
                        />
                    </div>

                    {/* 모임 목록 */}
                    <div className="space-y-6">
                        {meetingPosts.map((meeting) => {
                            const isUserWaiting = isUserInWaitRoom(meeting.chatRoomId);
                            const isUserJoined = isUserInJoinRoom(meeting.chatRoomId);
                            const isRoomOwner = meeting.memberId === currentUser?.id;

                            return (
                                <div
                                    key={meeting.chatRoomId}
                                    className={`bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 ${
                                        isUserJoined ? 'border-primary/20 hover:border-primary' : 'border-gray-100'
                                    }`}
                                    onClick={(e) => {
                                        if ((e.target as HTMLElement).closest('button')) return;
                                        // 모든 모임에서 확장/축소 가능하도록 수정
                                        setExpandedId(expandedId === meeting.chatRoomId ? null : meeting.chatRoomId);
                                    }}
                                >
                                    <div className={`p-6 transition-all duration-300 ${
                                        expandedId === meeting.chatRoomId ? 'min-h-[300px]' : ''
                                    }`}>
                                        {/* 상단 정보 */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${
                                                isUserJoined 
                                                    ? 'bg-green-50 text-green-600'  // 참여중일 때 초록색
                                                    : 'bg-primary/5 text-primary'   // 기본 상태
                                            }`}>
                                                {meeting.festivalName}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {new Date(meeting.createDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* 제목과 내용 */}
                                        <div className={`mb-4 transition-all duration-300 ${
                                            expandedId === meeting.chatRoomId ? 'min-h-[200px] overflow-y-auto' : ''
                                        }`}>
                                            <h3 className={`text-lg font-semibold text-gray-800 ${
                                                expandedId === meeting.chatRoomId ? 'mb-4 break-words' : 'mb-0 truncate'
                                            } hover:text-primary transition-colors`}>
                                                {meeting.roomTitle}
                                            </h3>
                                            {expandedId === meeting.chatRoomId && (
                                                <p className="text-gray-600 text-sm break-words whitespace-pre-wrap">
                                                    {meeting.roomContent}
                                                </p>
                                            )}
                                        </div>

                                        {/* 하단 정보와 버튼 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    {/* 참여 인원 아이콘과 숫자 */}
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span className="text-sm font-medium">{meeting.joinMemberNum}/{meeting.roomMemberLimit}</span>
                                                    </div>
                                                    
                                                    {/* 참여 인원 프로그레스 바 */}
                                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-300 bg-primary" 
                                                            style={{ 
                                                                width: `${(meeting.joinMemberNum / meeting.roomMemberLimit) * 100}%` 
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* 참여/대기 상태 뱃지 */}
                                                {(isUserJoined || isUserWaiting) && (
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        isUserJoined 
                                                            ? 'bg-green-50 text-green-600' 
                                                            : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                        {isUserJoined ? '참여중' : '대기중'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isUserJoined ? (
                                                    <>
                                                        <button
                                                            className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatRoomClick(meeting.chatRoomId, isUserJoined);
                                                            }}
                                                        >
                                                            입장하기
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                            isUserWaiting 
                                                                ? "text-gray-500 border border-gray-300 hover:bg-gray-50" 
                                                                : "bg-primary text-white hover:bg-primary/90"
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!currentUserID) {
                                                                alert("로그인이 필요합니다.");
                                                                return;
                                                            }
                                                            handleJoinClick(meeting.chatRoomId, isUserWaiting);
                                                        }}
                                                    >
                                                        {isUserWaiting ? "대기 취소" : "참여 신청"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 로딩 인디케이터 */}
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

export default Meeting